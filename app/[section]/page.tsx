'use client';

import { use, useEffect, useState } from 'react';
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

export default function SectionPage({
  params,
  profileId,
}: {
  params: Promise<{ section: string }>;
  profileId?: string;
}) {
  const { section } = use(params);
  const info = sections[section];
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
    if (
      !profileId ||
      !window.confirm('¿Eliminar este perfil y todos sus datos locales? Esta acción no se puede deshacer.')
    )
      return;
    saveProfiles(deleteProfile(loadProfiles(), profileId));
    deleteProfileData(profileId);
    router.push('/');
  };
  if (!info) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', p: { xs: 2, md: 6 } }}>
        <Paper role="alert" sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
          <Typography variant="h2">Página no encontrada</Typography>
          <Button component={Link} href={profileId ? `/profiles/${profileId}` : '/'} sx={{ mt: 2 }}>
            Volver al espacio de trabajo
          </Button>
        </Paper>
      </Box>
    );
  }
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
              Volver al dashboard
            </Button>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 3 }}>
              <Box>
                <Typography variant="overline" color="primary.main" fontWeight={800}>
                  PERFIL PROFESIONAL
                </Typography>
                <Typography variant="h2">{info.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {info.description}
                </Typography>
              </Box>
            </Stack>
          </>
        )}
        {section === 'settings' ? (
          <Paper sx={{ p: 3 }}>
            <Typography fontWeight={800} sx={{ mb: 2 }}>
              Proveedor de IA
            </Typography>
            <TextField
              select
              fullWidth
              label="Proveedor"
              value={config.provider}
              onChange={(event) => setConfig({ ...config, provider: event.target.value })}
            >
              <MenuItem value="openai-compatible">OpenAI-compatible API</MenuItem>
              <MenuItem value="local">Local OpenAI-compatible server</MenuItem>
              <MenuItem value="custom">Custom OpenAI-compatible API</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="URL base del proveedor"
              value={config.endpoint}
              onChange={(event) => setConfig({ ...config, endpoint: event.target.value })}
              placeholder="https://provider.example/v1"
              helperText="Usa la URL base de una API compatible con OpenAI. También se admiten servicios locales por HTTP."
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              label="Modelo"
              value={config.model}
              onChange={(event) => setConfig({ ...config, model: event.target.value })}
              sx={{ mt: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Token"
              value={config.token}
              onChange={(event) => setConfig({ ...config, token: event.target.value })}
              sx={{ mt: 2 }}
              autoComplete="new-password"
              helperText="Se mantiene en la sesión actual del navegador y se elimina al cerrarla. Evita dispositivos compartidos."
            />
            <Button variant="contained" sx={{ mt: 2 }} onClick={saveConfig}>
              Guardar configuración
            </Button>
            {saved && <Chip label="Configuración guardada" color="success" sx={{ ml: 2 }} />}
            <Divider sx={{ my: 3 }} />
            <Typography variant="h6" fontWeight={800}>
              Tus datos
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Exporta este perfil o elimina sus datos locales, registros, ajustes y token de sesión.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                startIcon={<DownloadRoundedIcon />}
                onClick={downloadProfile}
                disabled={!profileId}
              >
                Exportar datos del perfil
              </Button>
              <Button
                color="error"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={removeCurrentProfile}
                disabled={!profileId}
              >
                Eliminar perfil y datos
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
                  VISTA PREVIA DE LINKEDIN
                </Typography>
                <Typography variant="h4" sx={{ mt: 1 }}>
                  {portfolioRecords.find((item) => item.section === 'basic')?.values['Professional Headline'] ||
                    'Titular profesional'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 1 }}>
                  {portfolioRecords.find((item) => item.section === 'basic')?.values['Professional Summary'] ||
                    'Agrega tu resumen profesional en Información básica para ver aquí la sección «Acerca de». '}
                </Typography>
                <Button component={Link} href={`/profiles/${profileId}/basic`} sx={{ mt: 1 }}>
                  Editar perfil profesional
                </Button>
              </Paper>
            )}
            <Paper sx={{ p: 3 }}>
              <Typography variant="overline" color="text.secondary">
                BORRADOR PARA REVISAR
              </Typography>
              <Typography variant="h4" sx={{ mt: 1 }}>
                {section === 'linkedin' ? 'Proyectos destacados' : 'Selected Projects'}
              </Typography>
              <Typography color="text.secondary" sx={{ mt: 1 }}>
                {section === 'linkedin'
                  ? 'Revisa estos proyectos antes de publicarlos en tu perfil.'
                  : 'Review the descriptions and ownership details before sharing this profile.'}
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
                  <Typography color="text.secondary">
                    Aún no hay proyectos. Agrega uno para completar esta sección de tu perfil.
                  </Typography>
                )}
              </Stack>
              <Button component={Link} href={`/profiles/${profileId}/projects`} sx={{ mt: 1 }}>
                Agregar o editar proyectos
              </Button>
            </Paper>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h4">Habilidades</Typography>
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
                  Aún no hay habilidades. Agrega las que puedas respaldar con ejemplos.
                </Typography>
              )}
              <Button component={Link} href={`/profiles/${profileId}/skills`} sx={{ mt: 1 }}>
                Agregar o editar habilidades
              </Button>
            </Paper>
            {saved && <Chip label="Draft updated" color="success" />}
          </Stack>
        ) : (
          <>
            <CareerCoach section={section} fields={info.fields} profileId={profileId} onProposal={setProposal} />
            {proposal && (
              <Paper sx={{ p: 2, mb: 2, border: '1px solid #b7c8ff' }}>
                <Typography variant="body2" fontWeight={700}>
                  Propuesta pendiente de confirmación ({proposal.confidence})
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 1.5 }}>
                  {Object.entries(proposal.values).map(([field, value]) => (
                    <TextField
                      key={field}
                      label={field}
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
                  Fuente: {proposal.source}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    variant="contained"
                    onClick={confirmProposal}
                    disabled={!Object.values(proposal.values).some((value) => value.trim())}
                  >
                    Confirmar y guardar
                  </Button>
                  <Button onClick={() => setProposal(null)}>Descartar</Button>
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
                        `Registro ${index + 1}`}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={2}>
                      {info.fields.map((field) => (
                        <TextField
                          key={field}
                          label={getFieldLabel(field)}
                          defaultValue={record.values[field] || ''}
                          fullWidth
                          size="small"
                          helperText={
                            field === 'Professional Headline'
                              ? 'En inglés: el titular que aparecerá en tu CV.'
                              : field === 'Professional Summary'
                                ? 'En inglés: tu resumen para el CV y LinkedIn.'
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
                          Guardar cambios
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
                          Eliminar
                        </Button>
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
            <Button variant="outlined" sx={{ mt: 2 }} onClick={() => profileId && persist(createRecord(section, {}))}>
              Agregar registro
            </Button>
          </>
        )}
      </Box>
    </Box>
  );
}

function getFieldLabel(field: string) {
  if (field === 'Professional Headline') return 'Titular profesional';
  if (field === 'Professional Summary') return 'Resumen profesional';
  return field;
}
