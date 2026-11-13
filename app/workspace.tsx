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
import { appendAnswer, maxAnswerLength } from '../lib/workflow';
import { loadProfiles, saveProfiles } from '../lib/profiles/storage';
import { loadAiConfig } from '../lib/ai/config';
import { getSystemPrompt } from '../lib/ai/prompts';
import { streamChat } from '../lib/ai/client';
import { CvTailor } from './components/cv-tailor';
import { LocaleToggle, useI18n } from './i18n';
const sectionLinks = [
  [SpaceDashboardRoundedIcon, 'dashboard', '/'],
  [DescriptionOutlinedIcon, 'basic', '/basic'],
  [InsightsRoundedIcon, 'education', '/education'],
  [DescriptionOutlinedIcon, 'experience', '/experience'],
  [DescriptionOutlinedIcon, 'projects', '/projects'],
  [StarOutlineRoundedIcon, 'skills', '/skills'],
  [DescriptionOutlinedIcon, 'linkedin', '/linkedin'],
  [DescriptionOutlinedIcon, 'curriculum', '/curriculum'],
] as const;
export default function Workspace({ profileId }: { profileId: string }) {
  const { locale, t } = useI18n();
  const steps =
    locale === 'es'
      ? [
          { title: 'Tu dirección', note: 'El trabajo que buscas' },
          { title: 'Tu aporte', note: 'El problema que resuelves' },
          { title: 'Tu evidencia', note: 'Un logro concreto' },
        ]
      : [
          { title: 'Your direction', note: 'The work you want' },
          { title: 'Your contribution', note: 'The problem you solve' },
          { title: 'Your evidence', note: 'A concrete achievement' },
        ];
  const prompts =
    locale === 'es'
      ? [
          '¿Qué tipo de trabajo te gustaría conseguir en los próximos meses?',
          '¿Qué problema te gusta resolver y qué personas se benefician de tu trabajo?',
          'Cuéntame un momento en que lograste algo de lo que te sientes orgulloso.',
        ]
      : [
          'What kind of work would you like to find in the coming months?',
          'What problems do you enjoy solving, and who benefits from your work?',
          'Tell me about a time you achieved something you are proud of.',
        ];
  const pathname = usePathname();
  const [answer, setAnswer] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const [assistant, setAssistant] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiConfigured, setAiConfigured] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<ReturnType<typeof loadProfiles>[number] | null>(null);
  const abortRef = useRef<AbortController | undefined>(undefined);
  useEffect(() => {
    const profile = loadProfiles().find((item) => item.id === profileId);
    setCurrentProfile(profile ?? null);
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
      setAssistant(t('savedOnContinue') + ' ' + t('configureAi'));
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
            content: getSystemPrompt(config.systemPrompts, locale, 'guidedReflection'),
          },
          {
            role: 'user',
            content: next
              .map(
                (item, index) =>
                  `${locale === 'es' ? 'Pregunta' : 'Question'}: ${prompts[index]}\n${locale === 'es' ? 'Respuesta' : 'Answer'}: ${item}`,
              )
              .join('\n\n'),
          },
        ],
        (token) => setAssistant((value) => value + token),
        abortRef.current.signal,
      );
    } catch (error) {
      if ((error as Error).name !== 'AbortError')
        setAssistant(
          locale === 'es'
            ? `No pude conectar con el proveedor. Puedes continuar en modo local o revisar ${t('settings').toLowerCase()}.`
            : 'Could not connect to the provider. You can continue locally or review Settings.',
        );
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
          {t('workspace').toUpperCase()}
        </Typography>
        {renderSectionLinks(profileId, pathname, t)}
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
            <Typography variant="body2">{t('settings')}</Typography>
          </Stack>
          <Stack
            component={Link}
            href="/"
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ mt: 2, px: 1, textDecoration: 'none', color: 'inherit' }}
          >
            <Avatar sx={{ width: 30, height: 30, bgcolor: '#dbe4ff', color: '#1740c4', fontSize: 11 }}>
              {locale === 'es' ? 'TÚ' : 'YOU'}
            </Avatar>
            <Box>
              <Typography variant="body2" color="white" fontWeight={700}>
                {t('changeProfile')}
              </Typography>
              <Typography variant="caption" sx={{ color: '#9ba9c2' }}>
                {t('localProfile')}
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
            aria-label={t('openNav')}
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen(true)}
            sx={{ display: { xs: 'inline-flex', md: 'none' } }}
          >
            <MenuRoundedIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            {t('route')}{' '}
            <Box component="span" sx={{ mx: 1, color: '#c6cfdf' }}>
              /
            </Box>{' '}
            {t('careerDirection')}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocaleToggle />
            <Button
              component={Link}
              size="small"
              href={`/profiles/${profileId}/settings`}
              startIcon={<SettingsOutlinedIcon />}
            >
              {t('settingsAi')}
            </Button>
            <Avatar sx={{ width: 32, height: 32, bgcolor: '#dbe4ff', color: '#1740c4', fontSize: 11, fontWeight: 800 }}>
              {locale === 'es' ? 'TÚ' : 'YOU'}
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
            aria-label={t('navLabel')}
            sx={{ width: 290, minHeight: '100%', p: 2.5, bgcolor: '#101b32' }}
          >
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 4 }}>
              <Typography id="mobile-navigation-title" component="span" fontWeight={800} fontSize={20} color="white">
                IA Curriculum
              </Typography>
              <IconButton aria-label={t('closeNav')} onClick={() => setMobileNavOpen(false)} sx={{ color: 'white' }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
            <Typography variant="caption" sx={{ px: 1, color: '#aab7d0', fontWeight: 800, letterSpacing: '.1em' }}>
              {t('workspace').toUpperCase()}
            </Typography>
            {renderSectionLinks(profileId, pathname, t, () => setMobileNavOpen(false))}
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
              <Typography variant="body2">{t('settings')}</Typography>
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
              <Avatar sx={{ width: 30, height: 30, bgcolor: '#dbe4ff', color: '#1740c4', fontSize: 11 }}>
                {locale === 'es' ? 'TÚ' : 'YOU'}
              </Avatar>
              <Box>
                <Typography variant="body2" color="white" fontWeight={700}>
                  {t('changeProfile')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#9ba9c2' }}>
                  {t('localProfile')}
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Drawer>
        <Box className="soft-grid" sx={{ minHeight: 'calc(100vh - 72px)', px: { xs: 2, md: 5 }, py: { xs: 3, md: 5 } }}>
          <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
            {currentProfile?.sourceProfileId && currentProfile.targetDescription && (
              <CvTailor
                profileId={profileId}
                sourceProfileId={currentProfile.sourceProfileId}
                focus={currentProfile.role}
                targetDescription={currentProfile.targetDescription}
              />
            )}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ sm: 'center' }}
              sx={{ mb: 4 }}
            >
              <Box>
                <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing=".12em">
                  {t('workspaceKicker')}
                </Typography>
                <Typography variant="h1" sx={{ fontSize: { xs: 34, md: 44 }, mt: 0.5 }}>
                  {t('workspaceTitle')}
                </Typography>
              </Box>
              <Button
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={() => {
                  if (messages.length && !window.confirm(t('clearSessionConfirm'))) return;
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
                {t('newSession')}
              </Button>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
              {[
                [t('reflections'), `${messages.length} / ${prompts.length}`, t('savedHere')],
                [
                  t('currentStage'),
                  messages.length >= steps.length ? t('complete') : steps[Math.max(messages.length - 1, 0)].title,
                  `${Math.round((Math.min(messages.length, prompts.length) / prompts.length) * 100)}% ${t('completePct')}`,
                ],
                [
                  t('nextStep'),
                  messages.length >= prompts.length
                    ? t('completeProfile')
                    : steps[Math.min(messages.length, steps.length - 1)].note,
                  t('saveShare'),
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
                      aria-label={locale === 'es' ? 'Avance de reflexiones' : 'Reflection progress'}
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
                  {t('journey')}
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
                    <Typography fontWeight={800}>{t('discovery')}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('assistantReady')}
                    </Typography>
                  </Box>
                  <Chip
                    label={
                      messages.length >= prompts.length ? t('readyReview') : loading ? t('thinking') : t('savedDevice')
                    }
                    size="small"
                    color="primary"
                    sx={{ ml: 'auto', fontSize: 10, fontWeight: 800 }}
                  />
                </Stack>
                {(prompts[messages.length] ?? null) ? (
                  <>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                      {prompts[messages.length] ?? null}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {t('promptLead')}
                    </Typography>
                  </>
                ) : (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>
                      {t('baseProfile')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {t('reviewAnswers')}
                    </Typography>
                    <Button component={Link} href={`/profiles/${profileId}/basic`} sx={{ mt: 1 }}>
                      {t('reviewBasic')}
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
                {(prompts[messages.length] ?? null) && (
                  <TextField
                    fullWidth
                    label={t('answer')}
                    multiline
                    minRows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder={t('placeholder')}
                    inputProps={{ maxLength: maxAnswerLength }}
                    sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#fbfcfe' } }}
                  />
                )}
                {(prompts[messages.length] ?? null) && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {answer.length}/{maxAnswerLength} {t('chars')} · {t('savedOnContinue')}{' '}
                      {aiConfigured ? t('sendToProvider') : t('configureAi')}
                    </Typography>
                    <Button
                      variant="contained"
                      endIcon={<ArrowForwardRoundedIcon />}
                      onClick={send}
                      disabled={loading || !answer.trim()}
                    >
                      {loading ? t('generating') : t('continue')}
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

function renderSectionLinks(profileId: string, pathname: string, t: (key: string) => string, onNavigate?: () => void) {
  return (
    <Stack component="nav" aria-label={t('navLabel')} spacing={0.6} sx={{ mt: 1.5 }}>
      {sectionLinks.map(([Icon, key, path]) => {
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
              {t(key)}
            </Typography>
          </Stack>
        );
      })}
    </Stack>
  );
}
