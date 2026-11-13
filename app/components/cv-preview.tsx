'use client';

import type { CSSProperties, ReactNode } from 'react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Box, Button, ButtonBase, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import type { RecordItem } from '../../lib/profiles/records';
import { cvTemplates, defaultCvTemplateId, getCvTemplate } from '../../lib/profiles/cv-templates';
import { cvPalettes, defaultCvPaletteId, getCvPalette, type CvPaletteColors } from '../../lib/profiles/cv-palettes';
import { loadProfiles, saveProfiles } from '../../lib/profiles/storage';
import { LocaleToggle, useI18n } from '../i18n';

export function CvPreview({ profileId, records }: { profileId?: string; records: RecordItem[] }) {
  const { t } = useI18n();
  const [templateId, setTemplateId] = useState(defaultCvTemplateId);
  const [paletteId, setPaletteId] = useState(defaultCvPaletteId);
  const [customPalette, setCustomPalette] = useState<CvPaletteColors | undefined>();
  const [showIcons, setShowIcons] = useState(false);
  const template = getCvTemplate(templateId);
  const palette = customPalette ?? getCvPalette(paletteId).colors;
  const one = (section: string) => records.find((record) => record.section === section);
  const basic = one('basic')?.values ?? {};
  const experiences = records.filter((record) => record.section === 'experience');
  const education = records.filter((record) => record.section === 'education');
  const projects = records.filter((record) => record.section === 'projects');
  const skills = records.filter((record) => record.section === 'skills');
  const contacts = [basic.Email, basic.Teléfono, basic['Ciudad y país'], basic.LinkedIn].filter(Boolean);

  useEffect(() => {
    const profile = loadProfiles().find((item) => item.id === profileId);
    const saved = profile?.cvTemplateId;
    setTemplateId(getCvTemplate(saved).id);
    setPaletteId(profile?.cvPaletteId === 'custom' ? defaultCvPaletteId : getCvPalette(profile?.cvPaletteId).id);
    setCustomPalette(profile?.cvCustomPalette);
    setShowIcons(profile?.cvShowSectionIcons ?? false);
  }, [profileId]);

  const selectTemplate = (id: string) => {
    setTemplateId(id);
    if (!profileId) return;
    saveProfiles(
      loadProfiles().map((profile) => (profile.id === profileId ? { ...profile, cvTemplateId: id } : profile)),
    );
  };

  const savePalette = (id: string, colors?: CvPaletteColors) => {
    setPaletteId(id);
    setCustomPalette(colors);
    if (!profileId) return;
    saveProfiles(
      loadProfiles().map((profile) =>
        profile.id === profileId ? { ...profile, cvPaletteId: id, cvCustomPalette: colors } : profile,
      ),
    );
  };

  const editCustomColor = (key: keyof CvPaletteColors, value: string) => {
    const next = { ...(customPalette ?? palette), [key]: value };
    savePalette('custom', next);
  };

  const toggleIcons = (enabled: boolean) => {
    setShowIcons(enabled);
    if (!profileId) return;
    saveProfiles(
      loadProfiles().map((profile) =>
        profile.id === profileId ? { ...profile, cvShowSectionIcons: enabled } : profile,
      ),
    );
  };

  const contactBlock = (
    <Box className="cv-contact">
      {contacts.map((item) => (
        <Typography component="p" key={item}>
          {item}
        </Typography>
      ))}
    </Box>
  );

  return (
    <Box className="cv-workspace">
      <Stack className="cv-toolbar" direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            component={Link}
            href={profileId ? `/profiles/${profileId}` : '/'}
            startIcon={<ArrowBackRoundedIcon />}
          >
            {t('cvBack')}
          </Button>
          <Typography variant="caption" color="text.secondary">
            {t('cvDraft')}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1}>
          <FormControlLabel
            control={<Switch size="small" checked={showIcons} onChange={(_, checked) => toggleIcons(checked)} />}
            label={t('cvSectionIcons')}
          />
          <LocaleToggle />
          <Button variant="contained" onClick={() => window.print()}>
            {t('printPdf')}
          </Button>
        </Stack>
      </Stack>

      <Box className="cv-template-picker" role="radiogroup" aria-label={t('cvTemplatePicker')}>
        {cvTemplates.map((option) => (
          <ButtonBase
            key={option.id}
            className={`cv-template-option ${templateId === option.id ? 'selected' : ''}`}
            role="radio"
            aria-checked={templateId === option.id}
            tabIndex={templateId === option.id ? 0 : -1}
            onClick={() => selectTemplate(option.id)}
          >
            <Box className="cv-template-sample" sx={{ '--sample-primary': palette.primary } as CSSProperties}>
              <Box />
              <Box />
              <Box />
            </Box>
            <Typography component="span" fontWeight={700}>
              {t(option.nameKey)}
            </Typography>
            <Typography component="span" variant="caption">
              {t(option.descriptionKey)}
            </Typography>
          </ButtonBase>
        ))}
      </Box>

      <Box className="cv-palette-picker" aria-label={t('cvPalettePicker')}>
        <Typography variant="subtitle2">{t('cvPalettePicker')}</Typography>
        <Box className="cv-palette-options" role="radiogroup" aria-label={t('cvPalettePicker')}>
          {cvPalettes.map((option) => (
            <ButtonBase
              key={option.id}
              role="radio"
              aria-checked={!customPalette && paletteId === option.id}
              className={`cv-palette-option ${!customPalette && paletteId === option.id ? 'selected' : ''}`}
              onClick={() => savePalette(option.id)}
            >
              <span style={{ background: option.colors.primary }} />
              <span style={{ background: option.colors.secondary }} />
              {t(option.nameKey)}
            </ButtonBase>
          ))}
        </Box>
        <Box className="cv-custom-palette">
          <Typography variant="caption">{t('cvCustomPalette')}</Typography>
          {(['primary', 'secondary', 'text', 'muted', 'paper'] as const).map((key) => (
            <label key={key}>
              {t(`cvColor_${key}`)}
              <input type="color" value={palette[key]} onChange={(event) => editCustomColor(key, event.target.value)} />
            </label>
          ))}
        </Box>
      </Box>

      <Box
        component="article"
        className={`cv-document cv-template-${template.id} cv-heading-${template.heading}`}
        style={
          {
            '--cv-primary': palette.primary,
            '--cv-secondary': palette.secondary,
            '--cv-text': palette.text,
            '--cv-muted': palette.muted,
            '--cv-paper': palette.paper,
            '--cv-primary-contrast': contrastText(palette.primary),
          } as CSSProperties
        }
      >
        <Box component="header" className={`cv-header cv-header-${template.header}`}>
          <Box className="cv-heading-copy">
            <Typography component="h1" className="cv-name">
              {basic['Nombre completo'] || t('yourName')}
            </Typography>
            {basic['Professional Headline'] && (
              <Typography className="cv-headline">{basic['Professional Headline']}</Typography>
            )}
          </Box>
          {template.layout !== 'sidebar' && contactBlock}
        </Box>

        <Box className={`cv-layout ${template.layout === 'sidebar' ? 'cv-layout-sidebar' : ''}`}>
          <Box component="main" className="cv-main">
            {basic['Professional Summary'] && (
              <CvSection title={t('profileHeading')} icon="person" showIcon={showIcons}>
                <Typography>{basic['Professional Summary']}</Typography>
              </CvSection>
            )}

            <CvSection title={t('experience')} icon="work" showIcon={showIcons}>
              {experiences.map((record) => (
                <Box className="cv-entry" key={record.id}>
                  <Stack className="cv-entry-heading" direction="row" justifyContent="space-between" gap={2}>
                    <Box>
                      <Typography className="cv-role">{record.values.Cargo}</Typography>
                      <Typography className="cv-organization">{record.values.Organización}</Typography>
                    </Box>
                    <Typography className="cv-dates">
                      {formatPeriod(record.values['Fecha de inicio'], record.values['Fecha de término'])}
                    </Typography>
                  </Stack>
                  <Box component="ul" className="cv-bullets">
                    {(record.values['Logros y responsabilidades'] || '')
                      .split('\n')
                      .filter(Boolean)
                      .map((line, index) => (
                        <li key={index}>{line.replace(/^[•-]\s*/, '')}</li>
                      ))}
                  </Box>
                </Box>
              ))}
            </CvSection>

            {template.layout === 'sidebar' ? (
              <>
                <CvSection title={t('selectedWork')} icon="folder" showIcon={showIcons}>
                  {projects.map((project) => (
                    <Project key={project.id} project={project} />
                  ))}
                </CvSection>
                <CvSection title={t('cvEducation')} icon="school" showIcon={showIcons}>
                  {education.map((record) => (
                    <Education key={record.id} record={record} />
                  ))}
                </CvSection>
              </>
            ) : (
              <Box className="cv-second-page">
                <Typography className="cv-continuation">
                  {basic['Nombre completo'] || t('yourName')} · {t('continued')}
                </Typography>
                <CvSection title={t('selectedWork')} icon="folder" showIcon={showIcons}>
                  {projects.map((project) => (
                    <Project key={project.id} project={project} />
                  ))}
                </CvSection>
                <CvSection title={t('skills')} icon="star" showIcon={showIcons}>
                  <Typography>
                    {skills
                      .map((record) => record.values.Skill)
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </CvSection>
                <CvSection title={t('cvEducation')} icon="school" showIcon={showIcons}>
                  {education.map((record) => (
                    <Education key={record.id} record={record} />
                  ))}
                </CvSection>
                <CvSection title={t('languages')} icon="language" showIcon={showIcons}>
                  <Typography>{t('nativeSpanish')}</Typography>
                </CvSection>
              </Box>
            )}
          </Box>
          {template.layout === 'sidebar' && (
            <Box component="aside" className="cv-sidebar">
              <CvSection title={t('contactHeading')} icon="contact_mail" showIcon={showIcons}>
                {contactBlock}
              </CvSection>
              <CvSection title={t('skills')} icon="star" showIcon={showIcons}>
                <Box component="ul" className="cv-bullets cv-skill-list">
                  {skills
                    .map((record) => record.values.Skill)
                    .filter(Boolean)
                    .map((skill, index) => (
                      <li key={`${skill}-${index}`}>{skill}</li>
                    ))}
                </Box>
              </CvSection>
              <CvSection title={t('languages')} icon="language" showIcon={showIcons}>
                <Typography>{t('nativeSpanish')}</Typography>
              </CvSection>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}

function Project({ project }: { project: RecordItem }) {
  return (
    <Box className="cv-project">
      <Typography className="cv-role">{project.values['Nombre del proyecto']}</Typography>
      <Typography className="cv-organization">{project.values.Rol}</Typography>
      <Typography>{project.values.Descripción}</Typography>
      {project.values['Resultado o enlace'] && (
        <Typography className="cv-tech">{project.values['Resultado o enlace']}</Typography>
      )}
    </Box>
  );
}

function Education({ record }: { record: RecordItem }) {
  return (
    <Stack className="cv-education" direction="row" justifyContent="space-between" gap={2}>
      <Box>
        <Typography className="cv-degree">{record.values['Título o programa']}</Typography>
        <Typography className="cv-organization">{record.values.Institución}</Typography>
      </Box>
      <Typography className="cv-dates">
        {formatPeriod(record.values['Fecha de inicio'], record.values['Fecha de término'])}
      </Typography>
    </Stack>
  );
}

function formatPeriod(start?: string, end?: string) {
  if (start && end && start === end) return start;
  return [start, end].filter(Boolean).join(' – ');
}

function contrastText(hex: string) {
  const rgb = hex
    .slice(1)
    .match(/.{2}/g)
    ?.map((part) => Number.parseInt(part, 16) / 255) ?? [0, 0, 0];
  const luminance = rgb
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4))
    .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
  return luminance > 0.42 ? '#17202a' : '#ffffff';
}

function CvSection({
  title,
  children,
  icon,
  showIcon,
}: {
  title: string;
  children: ReactNode;
  icon: string;
  showIcon: boolean;
}) {
  return (
    <Box component="section" className="cv-section">
      <Typography component="h2" className={`cv-section-title ${showIcon ? 'with-icon' : ''}`}>
        {showIcon && (
          <span className="material-icons cv-section-icon" aria-hidden="true">
            {icon}
          </span>
        )}
        {title}
      </Typography>
      {children}
    </Box>
  );
}
