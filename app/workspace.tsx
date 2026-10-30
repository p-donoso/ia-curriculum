'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SpaceDashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded';
import StarOutlineRoundedIcon from '@mui/icons-material/StarOutlineRounded';
import { appendAnswer, maxAnswerLength, nextPrompt, prompts } from '../lib/workflow';
import { loadProfiles, saveProfiles } from '../lib/profiles/storage';
import { loadAiConfig } from '../lib/ai/config';
import { streamChat } from '../lib/ai/client';
const steps = [
  { title: 'Tu dirección', note: 'El trabajo que buscas' },
  { title: 'Tu aporte', note: 'El problema que resuelves' },
  { title: 'Tu evidencia', note: 'Un logro concreto' },
];
const sectionLinks = [
  [SpaceDashboardRoundedIcon, 'Dashboard', '/'],
  [DescriptionOutlinedIcon, 'Información básica', '/basic'],
  [InsightsRoundedIcon, 'Educación', '/education'],
  [DescriptionOutlinedIcon, 'Experiencia laboral', '/experience'],
  [DescriptionOutlinedIcon, 'Proyectos', '/projects'],
  [StarOutlineRoundedIcon, 'Habilidades', '/skills'],
  [DescriptionOutlinedIcon, 'LinkedIn', '/linkedin'],
  [DescriptionOutlinedIcon, 'Curriculum', '/curriculum'],
] as const;
export default function Workspace({ profileId = 'alex' }: { profileId?: string }) {
  const pathname = usePathname();
  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [assistant, setAssistant] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const abortRef = useRef<AbortController | undefined>(undefined);
  useEffect(() => {
    const profile = loadProfiles().find((item) => item.id === profileId);
    setMessages(profile?.answers ?? []);
    const aiConfig = loadAiConfig(profileId);
    setAiConfigured(Boolean(aiConfig.token && aiConfig.endpoint));
    return () => abortRef.current?.abort();
  }, [profileId]);
  const send = async () => {
    const next = appendAnswer(messages, answer);
    if (next.length === messages.length || loading || messages.length >= prompts.length) return;
    setMessages(next);
    setAnswer('');
    const profiles = loadProfiles();
    saveProfiles(
      profiles.map((profile) =>
        profile.id === profileId ? { ...profile, answers: next, updatedAt: new Date().toISOString() } : profile,
      ),
    );
    const config = loadAiConfig(profileId);
    if (!config.token || !config.endpoint) {
      setAssistant(
        'Respuesta guardada en este dispositivo. Configura un proveedor de IA si quieres recibir sugerencias.',
      );
      return;
    }
    setLoading(true);
    setAssistant('');
    abortRef.current = new AbortController();
    try {
      await streamChat(
        config,
        [
          {
            role: 'system',
            content:
              'Eres un asesor de carrera breve y respetuoso. Refleja lo que la persona dijo, separa hechos de inferencias y no inventes logros, habilidades ni resultados. Ofrece una pregunta opcional para concretar su evidencia. La aplicación controla las preguntas principales.',
          },
          {
            role: 'user',
            content: next.map((item, index) => `Pregunta: ${prompts[index]}\nRespuesta: ${item}`).join('\n\n'),
          },
        ],
        (token) => setAssistant((value) => value + token),
        abortRef.current.signal,
      );
    } catch (error) {
      if ((error as Error).name !== 'AbortError')
        setAssistant('No pude conectar con el proveedor. Puedes continuar en modo local o revisar Configuración.');
    } finally {
      setLoading(false);
      abortRef.current = undefined;
    }
  };
  return (
    <Box className="app-shell">
      <Box
        component="aside"
        className="sidebar"
        sx={{ p: 2.5, display: { xs: 'none', md: 'flex' }, flexDirection: 'column' }}
      >
        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ px: 1, mb: 5 }}>
          <Avatar sx={{ bgcolor: '#6f8cff', width: 34, height: 34, fontWeight: 800 }}>B</Avatar>
          <Typography fontWeight={800} fontSize={21} letterSpacing="-.04em" color="white">
            IA Curriculum
          </Typography>
        </Stack>
        <Typography variant="caption" sx={{ px: 1, color: '#9ba9c2', fontWeight: 800, letterSpacing: '.1em' }}>
          WORKSPACE
        </Typography>
        {renderSectionLinks(profileId, pathname)}
        <Box sx={{ mt: 'auto' }}>
          <Divider sx={{ borderColor: '#293b5e', mb: 2 }} />
          <Stack
            component={Link}
            href={`/profiles/${profileId}/settings`}
            className="sidebar-link"
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ p: 1.2 }}
          >
            <SettingsOutlinedIcon fontSize="small" />
            <Typography variant="body2">Configuración</Typography>
          </Stack>
          <Stack
            component={Link}
            href="/"
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ mt: 2, px: 1, textDecoration: 'none', color: 'inherit' }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: '#dbe4ff', color: '#1740c4', fontSize: 11 }}>TÚ</Avatar>
            <Box>
              <Typography variant="body2" color="white" fontWeight={700}>
                Cambiar de perfil
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ba9c2' }}>
                Plan gratuito
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>
      <Box className="main-shell">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ height: 72, px: { xs: 2, md: 5 }, borderBottom: '1px solid #e5eaf2', bgcolor: '#fff' }}
        >
          <IconButton
            aria-label="Abrir menú de navegación"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Mi recorrido{' '}
            <Box component="span" sx={{ mx: 1, color: '#c6cfdf' }}>
              /
            </Box>{' '}
            Dirección profesional
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              component={Link}
              size="small"
              href={`/profiles/${profileId}/settings`}
              startIcon={<SettingsOutlinedIcon />}
            >
              Configurar IA
            </Button>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#dbe4ff', color: '#1740c4', fontSize: 11, fontWeight: 800 }}>
              TÚ
            </Avatar>
          </Stack>
        </Stack>
        <Drawer
          open={mobileNavOpen}
          onClose={() => setMobileNavOpen(false)}
          slotProps={{ paper: { 'aria-labelledby': 'mobile-navigation-title' } }}
        >
          <Box
            component="nav"
            aria-label="Navegación principal"
            sx={{ width: 290, minHeight: '100%', p: 2.5, bgcolor: '#101b32' }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
              <Typography id="mobile-navigation-title" component="span" fontWeight={800} fontSize={20} color="white">
                IA Curriculum
              </Typography>
              <IconButton
                aria-label="Cerrar menú de navegación"
                onClick={() => setMobileNavOpen(false)}
                sx={{ color: 'white' }}
              >
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" sx={{ px: 1, color: '#aab7d0', fontWeight: 800, letterSpacing: '.1em' }}>
              WORKSPACE
            </Typography>
            {renderSectionLinks(profileId, pathname, () => setMobileNavOpen(false))}
            <Divider sx={{ borderColor: '#293b5e', my: 2 }} />
            <Stack
              component={Link}
              href={`/profiles/${profileId}/settings`}
              onClick={() => setMobileNavOpen(false)}
              className="sidebar-link"
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ p: 1.2, textDecoration: 'none' }}
            >
              <SettingsOutlinedIcon fontSize="small" />
              <Typography variant="body2">Configuración</Typography>
            </Stack>
            <Stack
              component={Link}
              href="/"
              onClick={() => setMobileNavOpen(false)}
              direction="row"
              spacing={1.2}
              alignItems="center"
              sx={{ mt: 2, px: 1, textDecoration: 'none', color: 'inherit' }}
            >
              <Avatar sx={{ width: 30, height: 30, bgcolor: '#dbe4ff', color: '#1740c4', fontSize: 11 }}>TÚ</Avatar>
              <Typography variant="body2" color="white" fontWeight={700}>
                Cambiar de perfil
              </Typography>
            </Stack>
          </Box>
        </Drawer>
        <Box className="soft-grid" sx={{ minHeight: 'calc(100vh - 72px)', px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 } }}>
          <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              sx={{ mb: 4 }}
            >
              <Box>
                <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing=".12em">
                  ESPACIO DE TRABAJO PROFESIONAL
                </Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 }, mt: 0.5 }}>
                  Construyamos tu próximo paso.
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  if (
                    messages.length &&
                    !window.confirm('¿Borrar las respuestas guardadas y empezar una nueva sesión?')
                  )
                    return;
                  abortRef.current?.abort();
                  setMessages([]);
                  setAnswer('');
                  setAssistant('');
                  setLoading(false);
                  const profiles = loadProfiles();
                  saveProfiles(
                    profiles.map((profile) =>
                      profile.id === profileId
                        ? { ...profile, answers: [], updatedAt: new Date().toISOString() }
                        : profile,
                    ),
                  );
                }}
                sx={{ mt: { xs: 2, sm: 0 }, bgcolor: '#fff' }}
              >
                Nueva sesión
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
              {[
                ['REFLEXIONES', `${messages.length} de ${prompts.length}`, 'Guardadas solo en este dispositivo'],
                [
                  'ETAPA ACTUAL',
                  messages.length >= steps.length
                    ? 'Reflexión completa'
                    : steps[Math.max(messages.length - 1, 0)].title,
                  `${Math.round((Math.min(messages.length, prompts.length) / prompts.length) * 100)}% completado`,
                ],
                [
                  'SIGUIENTE PASO',
                  messages.length >= prompts.length
                    ? 'Completa tu perfil'
                    : steps[Math.min(messages.length, steps.length - 1)].note,
                  'Tú decides qué guardar y compartir',
                ],
              ].map((x, i) => (
                <Paper key={x[0]} sx={{ p: 2.5, flex: 1, border: '1px solid #e5eaf2' }}>
                  <Typography variant="caption" color="text.secondary">
                    {x[0]}
                  </Typography>
                  <Typography variant="h5" fontWeight={800} sx={{ mt: 1 }}>
                    {x[1]}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {x[2]}
                  </Typography>
                  {i === 0 && (
                    <LinearProgress
                      aria-label="Avance de reflexiones"
                      variant="determinate"
                      value={(Math.min(messages.length, prompts.length) / prompts.length) * 100}
                      sx={{ mt: 1, height: 7, borderRadius: 5 }}
                    />
                  )}
                </Paper>
              ))}
            </Stack>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '250px 1fr' }, gap: 3 }}>
              <Paper sx={{ p: 2.5, border: '1px solid #e5eaf2', height: 'fit-content' }}>
                <Typography variant="caption" color="text.secondary" fontWeight={800}>
                  TU RECORRIDO
                </Typography>
                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  {steps.map((s, i) => (
                    <Stack key={s.title} direction="row" spacing={1.3} alignItems="center">
                      <Avatar
                        sx={{
                          width: 28,
                          height: 28,
                          bgcolor: i < messages.length ? 'primary.main' : '#f0f3f8',
                          color: i < messages.length ? '#fff' : '#8694aa',
                          fontSize: 12,
                        }}
                      >
                        {i + 1}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={700}>
                          {s.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.note}
                        </Typography>
                      </Box>
                    </Stack>
                  ))}
                </Stack>
              </Paper>
              <Paper sx={{ p: { xs: 2.5, md: 4 }, border: '1px solid #e5eaf2' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                  <Avatar sx={{ bgcolor: '#eef0ff', color: '#5b3db8', width: 36, height: 36 }}>
                    <AutoAwesomeRoundedIcon fontSize="small" />
                  </Avatar>
                  <Box>
                    <Typography fontWeight={800}>Sesión de descubrimiento</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Tu asistente está listo para escucharte
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      messages.length >= prompts.length
                        ? 'LISTO PARA REVISAR'
                        : loading
                          ? 'PENSANDO'
                          : 'GUARDADO EN ESTE DISPOSITIVO'
                    }
                    size="small"
                    color="primary"
                    sx={{ ml: 'auto', fontSize: 10, fontWeight: 800 }}
                  />
                </Stack>
                {nextPrompt(messages.length) ? (
                  <>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                      {nextPrompt(messages.length)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      No buscamos una respuesta perfecta. Buscamos algo verdadero para empezar.
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                      Ya tienes una base para tu perfil.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Revisa tus respuestas y añade los detalles que quieras conservar.
                    </Typography>
                    <Button component={Link} href={`/profiles/${profileId}/basic`} sx={{ mt: 1 }}>
                      Revisar información básica
                    </Button>
                  </Box>
                )}
                {assistant && (
                  <Box role="status" aria-live="polite" sx={{ p: 1.5, mb: 1, bgcolor: '#eef0ff', borderRadius: 2 }}>
                    <Typography variant="body2">{assistant}</Typography>
                  </Box>
                )}
                {messages.map((m, i) => (
                  <Box key={i} sx={{ p: 1.5, mb: 1, bgcolor: '#f3f6fc', borderRadius: 2 }}>
                    <Typography variant="body2">{m}</Typography>
                  </Box>
                ))}
                {nextPrompt(messages.length) && (
                  <TextField
                    fullWidth
                    label="Tu respuesta"
                    multiline
                    minRows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Escribe aquí tu respuesta..."
                    inputProps={{ maxLength: maxAnswerLength }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fbfcfe' } }}
                  />
                )}
                {nextPrompt(messages.length) && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {answer.length}/{maxAnswerLength} caracteres · Guardado en este dispositivo al continuar.{' '}
                      {aiConfigured
                        ? 'Al continuar, enviarás tus respuestas al proveedor de IA configurado.'
                        : 'Configura una IA para recibir comentarios; las respuestas se quedan en este dispositivo.'}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={send}
                      disabled={loading || !answer.trim()}
                    >
                      {loading ? 'Generando…' : 'Continuar'}
                    </Button>
                  </Stack>
                )}
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

function renderSectionLinks(profileId: string, pathname: string, onNavigate?: () => void) {
  return (
    <Stack component="nav" aria-label="Navegación principal" spacing={0.6} sx={{ mt: 1.5 }}>
      {sectionLinks.map(([Icon, title, path]) => {
        const href = `/profiles/${profileId}${path === '/' ? '' : path}`;
        const active = pathname === href;
        return (
          <Stack
            key={path}
            component={Link}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={`sidebar-link ${active ? 'active' : ''}`}
            direction="row"
            spacing={1.5}
            alignItems="center"
            sx={{ p: 1.2, textDecoration: 'none' }}
          >
            <Icon fontSize="small" />
            <Typography variant="body2" fontWeight={active ? 700 : 400}>
              {title}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
