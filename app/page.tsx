'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { createProfile, loadProfiles, Profile, saveProfiles } from '../lib/profiles/storage';
import { LocaleToggle, useI18n } from './i18n';
export default function Home() {
  const { t } = useI18n();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  useEffect(() => setProfiles(loadProfiles()), []);
  const [role, setRole] = useState('');
  const add = () => {
    const next = [...profiles, { ...createProfile(name), role: role.trim() || 'Nuevo CV' }];
    saveProfiles(next);
    setProfiles(next);
    setName('');
    setRole('');
    setOpen(false);
  };
  return (
    <Box component="main" sx={{ minHeight: '100vh', bgcolor: '#f5f7fb', p: { xs: 3, md: 8 } }}>
      <Box sx={{ maxWidth: 1050, mx: 'auto' }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ mb: 8 }}>
          <Avatar sx={{ bgcolor: '#1740c4', fontWeight: 800 }}>I</Avatar>
          <Typography fontSize={22} fontWeight={800} color="primary.main">
            IA Curriculum
          </Typography>
          <Box sx={{ ml: 'auto' }}>
            <LocaleToggle />
          </Box>
        </Stack>
        <Typography variant="overline" color="primary.main" fontWeight={800} letterSpacing=".14em">
          {t('cvProfilesKicker')}
        </Typography>
        <Typography variant="h1" sx={{ fontSize: { xs: 40, md: 58 }, maxWidth: 680, mt: 1 }}>
          {t('cvProfilesTitle')}
        </Typography>
        <Typography color="text.secondary" fontSize={18} sx={{ mt: 2, mb: 5 }}>
          {t('cvProfilesDescription')}
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} flexWrap="wrap">
          {profiles.map((p) => (
            <Paper
              key={p.id}
              component={Link}
              href={`/profiles/${p.id}`}
              sx={{
                p: 3,
                width: { sm: 280 },
                textDecoration: 'none',
                color: 'inherit',
                border: '1px solid #e1e7f0',
                '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)' },
                transition: 'all .2s',
              }}
            >
              <Avatar sx={{ bgcolor: p.color, mb: 3 }}>{p.name[0]}</Avatar>
              <Typography variant="h6" fontWeight={800}>
                {p.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {p.role}
              </Typography>
              <Typography variant="body2" color="primary.main" fontWeight={700} sx={{ mt: 3 }}>
                {t('openProfile')}
              </Typography>
            </Paper>
          ))}
          <Paper
            component="button"
            onClick={() => setOpen(true)}
            sx={{
              p: 3,
              width: { sm: 280 },
              textAlign: 'left',
              border: '1px dashed #bdc9dc',
              bgcolor: 'transparent',
              cursor: 'pointer',
            }}
          >
            <Typography variant="h3" color="primary.main">
              +
            </Typography>
            <Typography variant="h6" fontWeight={800}>
              {t('newCv')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('separateCv')}
            </Typography>
          </Paper>
        </Stack>
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{t('createProfile')}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label={t('profileName')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={{ mt: 1 }}
          />
          <TextField
            fullWidth
            label={t('cvFocus')}
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder={t('cvFocusExample')}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('cancel')}</Button>
          <Button onClick={add} variant="contained" disabled={!name.trim()}>
            {t('createProfile')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
