'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Button, Stack, Typography } from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import type { RecordItem } from '../../lib/profiles/records';
import { LocaleToggle, useI18n } from '../i18n';

export function CvPreview({ profileId, records }: { profileId?: string; records: RecordItem[] }) {
  const { t } = useI18n();
  const one = (section: string) => records.find((record) => record.section === section);
  const basic = one('basic')?.values ?? {};
  const experiences = records.filter((record) => record.section === 'experience');
  const education = records.filter((record) => record.section === 'education');
  const projects = records.filter((record) => record.section === 'projects');
  const skills = records.filter((record) => record.section === 'skills');
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
          <LocaleToggle />
          <Button variant="contained" onClick={() => window.print()}>
            {t('printPdf')}
          </Button>
        </Stack>
      </Stack>

      <Box component="article" className="cv-document">
        <Box component="header" className="cv-header">
          <Typography component="h1" className="cv-name">
            {basic['Nombre completo'] || t('yourName')}
          </Typography>
          {basic['Professional Headline'] && (
            <Typography className="cv-headline">{basic['Professional Headline']}</Typography>
          )}
          <Typography className="cv-contact">
            {[basic.Email, basic.Teléfono, basic['Ciudad y país'], basic.LinkedIn].filter(Boolean).join(' · ')}
          </Typography>
        </Box>

        {basic['Professional Summary'] && (
          <CvSection title={t('profileHeading')}>
            <Typography>{basic['Professional Summary']}</Typography>
          </CvSection>
        )}

        <CvSection title={t('experience')}>
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

        <Box className="cv-second-page">
          <Typography className="cv-continuation">
            {basic['Nombre completo'] || t('yourName')} · {t('continued')}
          </Typography>
          <CvSection title={t('selectedWork')}>
            {projects.map((project) => (
              <Box className="cv-project" key={project.id}>
                <Typography className="cv-role">{project.values['Nombre del proyecto']}</Typography>
                <Typography className="cv-organization">{project.values.Rol}</Typography>
                <Typography>{project.values.Descripción}</Typography>
                {project.values['Resultado o enlace'] && (
                  <Typography className="cv-tech">{project.values['Resultado o enlace']}</Typography>
                )}
              </Box>
            ))}
          </CvSection>

          <CvSection title={t('skills')}>
            <Typography>{skills.map((record) => record.values.Skill).join(' · ')}</Typography>
          </CvSection>

          <CvSection title={t('cvEducation')}>
            {education.map((record) => (
              <Stack className="cv-education" direction="row" justifyContent="space-between" gap={2} key={record.id}>
                <Box>
                  <Typography className="cv-degree">{record.values['Título o programa']}</Typography>
                  <Typography className="cv-organization">{record.values.Institución}</Typography>
                </Box>
                <Typography className="cv-dates">
                  {formatPeriod(record.values['Fecha de inicio'], record.values['Fecha de término'])}
                </Typography>
              </Stack>
            ))}
          </CvSection>

          <CvSection title={t('languages')}>
            <Typography>{t('nativeSpanish')}</Typography>
          </CvSection>
        </Box>
      </Box>
    </Box>
  );
}

function formatPeriod(start?: string, end?: string) {
  if (start && end && start === end) return start;
  return [start, end].filter(Boolean).join(' – ');
}

function CvSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Box component="section" className="cv-section">
      <Typography component="h2" className="cv-section-title">
        {title}
      </Typography>
      {children}
    </Box>
  );
}
