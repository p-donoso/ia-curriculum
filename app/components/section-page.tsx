'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CareerCoach, type Proposal } from '../components/career-coach';
import { CvPreview } from '../components/cv-preview';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { defaultAiConfig, loadAiConfig, saveAiConfig, type ProviderConfig } from '../../lib/ai/config';
import { createRecord, deleteRecord, loadRecords, type RecordItem, saveRecord } from '../../lib/profiles/records';
import {
  deleteProfile,
  deleteProfileData,
  exportProfile,
  loadProfiles,
  saveProfiles,
} from '../../lib/profiles/storage';
import { sections } from '../../lib/profiles/sections';
import { LocaleToggle, useI18n } from '../i18n';

export default function SectionPage({ section, profileId }: { section: string; profileId?: string }) {
  const { locale, t } = useI18n();
  const sectionTitle: Record<string, string> = {
    basic: t('basic'),
    education: t('education'),
    experience: t('experience'),
    projects: t('projects'),
    skills: t('skills'),
    linkedin: t('linkedin'),
    curriculum: t('curriculum'),
    settings: t('settings'),
  };
  const sectionDesc: Record<string, string> = {
    basic: t('sectionBasicDesc'),
    education: t('sectionEducationDesc'),
    experience: t('sectionExperienceDesc'),
    projects: t('sectionProjectsDesc'),
    skills: t('sectionSkillsDesc'),
    linkedin: t('sectionLinkedinDesc'),
    curriculum: t('sectionCurriculumDesc'),
    settings: t('sectionSettingsDesc'),
  };
  const info = sections[section]
    ? { ...sections[section], title: sectionTitle[section], description: sectionDesc[section] }
    : undefined;
  const router = useRouter();
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [portfolioRecords, setPortfolioRecords] = useState<RecordItem[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<ProviderConfig>(defaultAiConfig);
  const isOutput = ['linkedin', 'curriculum'].includes(section);
  useEffect(() => {
    setConfig(loadAiConfig(profileId));
    if (profileId) {
      setRecords(loadRecords(profileId, section));
      if (['linkedin', 'curriculum'].includes(section)) {
        setPortfolioRecords(
          ['basic', 'experience', 'education', 'projects', 'skills'].flatMap((key) => loadRecords(profileId, key)),
        );
      }
    }
  }, [profileId, section]);
  const persist = (record: RecordItem) => {
    if (!profileId) return;
    saveRecord(profileId, record);
    setRecords(loadRecords(profileId, section));
    setSaved(true);
  };
  const confirmProposal = () => {
    if (proposal && profileId) persist(createRecord(section, proposal.values));
    setProposal(null);
  };
  const saveConfig = () => {
    if (profileId) saveAiConfig(profileId, config);
    setSaved(true);
  };
  const downloadProfile = () => {
    if (!profileId) return;
    const profile = loadProfiles().find((item) => item.id === profileId);
    if (!profile) return;
    const allRecords = ['basic', 'education', 'experience', 'projects', 'skills'].flatMap((key) =>
      loadRecords(profileId, key),
    );
    const url = URL.createObjectURL(
      new Blob([exportProfile(profile, allRecords)], { type: 'application/json;charset=utf-8' }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = `ia-curriculum-${profileId}.json`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1_000);
  };
  const removeCurrentProfile = () => {
    if (!profileId || !window.confirm(t('deleteConfirm'))) return;
    saveProfiles(deleteProfile(loadProfiles(), profileId));
    deleteProfileData(profileId);
    router.push('/');
  };
  if (!info) return null;
  return (
    <Box
      sx={
        section === 'curriculum'
          ? { minHeight: '100vh', bgcolor: '#e9edf2', p: 0 }
          : { minHeight: '100vh', bgcolor: '#f5f7fb', p: { xs: 2, md: 6 } }
      }
    >
      <Box sx={{ maxWidth: 900, mx: 'auto' }}>
        {section !== 'curriculum' && (
          <>
            <Button
              component={Link}
              href={profileId ? `/profiles/${profileId}` : '/'}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ mb: 3 }}
            >
              {t('backDashboard')}
            </Button>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="overline" color="primary.main" fontWeight={800}>
                  {t('profile')}
                </Typography>
                <Typography variant="h2">{info.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {info.description}
                </Typography>
              </Box>
              <LocaleToggle />
            </Stack>
          </>
        )}
        {section === 'settings' ? (
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={800} sx={{ mb: 2 }}>
              {t('providerAi')}
            </Typography>
            <TextField
              select
              fullWidth
              label={t('provider')}
              value={config.provider}
              onChange={(event) => setConfig({ ...config, provider: event.target.value })}
            >
              <MenuItem value="openai-compatible">OpenAI-compatible API</MenuItem>
              <MenuItem value="local">Local OpenAI-compatible server</MenuItem>
              <MenuItem value="custom">Custom OpenAI-compatible API</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label={t('baseUrl')}
              value={config.endpoint}
              onChange={(event) => setConfig({ ...config, endpoint: event.target.value })}
              placeholder="https://provider.example/v1"
              helperText={t('providerHelp')}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label={t('model')}
              value={config.model}
              onChange={(event) => setConfig({ ...config, model: event.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label={t('token')}
              value={config.token}
              onChange={(event) => setConfig({ ...config, token: event.target.value })}
              sx={{ mt: 2 }}
              autoComplete="new-password"
              helperText={t('tokenHelp')}
            />
            <Button variant="contained" sx={{ mt: 2 }} onClick={saveConfig}>
              {t('saveConfig')}
            </Button>
            {saved && <Chip label={t('configSaved')} color="success" sx={{ ml: 2 }} />}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={800}>
              {t('yourData')}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              {t('dataHelp')}
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={downloadProfile}
                disabled={!profileId}
              >
                {t('exportProfile')}
              </Button>
              <Button
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={removeCurrentProfile}
                disabled={!profileId}
              >
                {t('deleteProfile')}
              </Button>
            </Stack>
          </Paper>
        ) : section === 'curriculum' ? (
          <CvPreview profileId={profileId} records={portfolioRecords} />
        ) : isOutput ? (
          <Stack spacing={2}>
            {section === 'linkedin' && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="overline" color="text.secondary">
                  {t('linkedinPreview')}
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {portfolioRecords.find((item) => item.section === 'basic')?.values['Professional Headline'] ||
                    t('professionalHeadline')}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {portfolioRecords.find((item) => item.section === 'basic')?.values['Professional Summary'] ||
                    t('addSummary')}
                </Typography>
                <Button component={Link} href={`/profiles/${profileId}/basic`} sx={{ mt: 1 }}>
                  {t('editProfile')}
                </Button>
              </Paper>
            )}
            <Paper sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                {t('draftReview')}
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {section === 'linkedin' ? t('featuredProjects') : t('selectedProjects')}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {section === 'linkedin' ? t('reviewProjects') : t('reviewOwnership')}
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {portfolioRecords
                  .filter((item) => item.section === 'projects')
                  .map((project) => (
                    <Paper variant="outlined" key={project.id} sx={{ p: 2 }}>
                      <Typography variant="h6">{project.values['Nombre del proyecto']}</Typography>
                      <Typography variant="subtitle2" color="primary.main">
                        {project.values.Rol}
                      </Typography>
                      <Typography sx={{ mt: 1 }}>{project.values.Descripción}</Typography>
                      {project.values['Resultado o enlace'] && (
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                          {project.values['Resultado o enlace']}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                {!portfolioRecords.some((item) => item.section === 'projects') && (
                  <Typography color="text.secondary">{t('noProjects')}</Typography>
                )}
              </Stack>
              <Button component={Link} href={`/profiles/${profileId}/projects`} sx={{ mt: 1 }}>
                {t('editProjects')}
              </Button>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4">{t('skills')}</Typography>
              <Stack direction="row" useFlexGap flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
                {portfolioRecords
                  .filter((item) => item.section === 'skills')
                  .map((item) => (
                    <Box key={item.id}>
                      <Chip label={item.values.Skill} variant="outlined" />
                      {item.values.Evidence && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          {item.values.Evidence}
                        </Typography>
                      )}
                    </Box>
                  ))}
              </Stack>
              {!portfolioRecords.some((item) => item.section === 'skills') && (
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {t('noSkills')}
                </Typography>
              )}
              <Button component={Link} href={`/profiles/${profileId}/skills`} sx={{ mt: 1 }}>
                {t('editSkills')}
              </Button>
            </Paper>
            {saved && <Chip label={t('draftUpdated')} color="success" />}
          </Stack>
        ) : (
          <>
            <CareerCoach
              section={section}
              title={info.title}
              fields={info.fields}
              profileId={profileId}
              onProposal={setProposal}
            />
            {proposal && (
              <Paper sx={{ p: 2, mb: 2, border: '1px solid #b7c8ff' }}>
                <Typography variant="body2" fontWeight={700}>
                  {t('pendingProposal')} ({proposal.confidence})
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {Object.entries(proposal.values).map(([field, value]) => (
                    <TextField
                      key={field}
                      label={getFieldLabel(field, locale)}
                      value={value}
                      onChange={(event) =>
                        setProposal({ ...proposal, values: { ...proposal.values, [field]: event.target.value } })
                      }
                      fullWidth
                      size="small"
                    />
                  ))}
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  {t('source')}: {proposal.source}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={confirmProposal}
                    disabled={!Object.values(proposal.values).some((value) => value.trim())}
                  >
                    {t('confirmSave')}
                  </Button>
                  <Button onClick={() => setProposal(null)}>{t('discard')}</Button>
                </Stack>
              </Paper>
            )}
            <Stack spacing={1}>
              {records.map((record, index) => (
                <Accordion
                  key={record.id}
                  defaultExpanded={index === 0}
                  disableGutters
                  sx={{ border: '1px solid #e1e7f0', '&:before': { display: 'none' } }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />}>
                    <Typography fontWeight={800}>
                      {record.values['Nombre completo'] ||
                        record.values['Nombre del proyecto'] ||
                        record.values['Título o programa'] ||
                        record.values.Skill ||
                        record.values['Cargo'] ||
                        record.values['Institución'] ||
                        `${t('record')} ${index + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {info.fields.map((field) => (
                        <TextField
                          key={field}
                          label={getFieldLabel(field, locale)}
                          defaultValue={record.values[field] || ''}
                          fullWidth
                          size="small"
                          helperText={
                            field === 'Professional Headline'
                              ? t('englishHeadlineHelp')
                              : field === 'Professional Summary'
                                ? t('englishSummaryHelp')
                                : undefined
                          }
                          multiline={['Professional Summary', 'Descripción', 'Logros y responsabilidades'].includes(
                            field,
                          )}
                          minRows={
                            ['Professional Summary', 'Descripción', 'Logros y responsabilidades'].includes(field)
                              ? 3
                              : undefined
                          }
                          onBlur={(event) => {
                            record.values[field] = event.target.value;
                          }}
                        />
                      ))}
                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="outlined"
                          onClick={() => persist({ ...record, updatedAt: new Date().toISOString() })}
                        >
                          {t('saveChanges')}
                        </Button>
                        <Button
                          color="error"
                          startIcon={<DeleteOutlineRoundedIcon />}
                          onClick={() => {
                            if (profileId) {
                              deleteRecord(profileId, record.id);
                              setRecords(loadRecords(profileId, section));
                            }
                          }}
                        >
                          {t('delete')}
                        </Button>
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => profileId && persist(createRecord(section, {}))}>
              {t('addRecord')}
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

function getFieldLabel(field: string, locale: 'es' | 'en') {
  const translated: Record<string, [string, string]> = {
    'Nombre completo': ['Nombre completo', 'Full name'],
    'Professional Headline': ['Titular profesional', 'Professional headline'],
    'Professional Summary': ['Resumen profesional', 'Professional summary'],
    Email: ['Correo electrónico', 'Email'],
    Teléfono: ['Teléfono', 'Phone'],
    'Ciudad y país': ['Ciudad y país', 'City and country'],
    'Estado civil': ['Estado civil', 'Marital status'],
    'Sitio web': ['Sitio web', 'Website'],
    Institución: ['Institución', 'Institution'],
    'Título o programa': ['Título o programa', 'Degree or program'],
    'Fecha de inicio': ['Fecha de inicio', 'Start date'],
    'Fecha de término': ['Fecha de término', 'End date'],
    Descripción: ['Descripción', 'Description'],
    Organización: ['Organización', 'Organization'],
    Cargo: ['Cargo', 'Role'],
    'Logros y responsabilidades': ['Logros y responsabilidades', 'Achievements and responsibilities'],
    'Nombre del proyecto': ['Nombre del proyecto', 'Project name'],
    Rol: ['Rol', 'Role'],
    Fecha: ['Fecha', 'Date'],
    'Resultado o enlace': ['Resultado o enlace', 'Outcome or link'],
    Skill: ['Habilidad', 'Skill'],
    Category: ['Categoría', 'Category'],
    Evidence: ['Evidencia', 'Evidence'],
  };
  return translated[field]?.[locale === 'es' ? 0 : 1] ?? field;
}
