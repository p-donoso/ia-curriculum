'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Alert,
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
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { loadAiConfig } from '../../lib/ai/config';
import { buildTailoringContext, tailorBasic } from '../../lib/ai/tailoring';
import { createRecord, loadRecords, saveRecord } from '../../lib/profiles/records';
import { useI18n } from '../i18n';

export function CvTailor({
  profileId,
  sourceProfileId,
  focus,
  targetDescription,
}: {
  profileId: string;
  sourceProfileId: string;
  focus: string;
  targetDescription: string;
}) {
  const { locale, t } = useI18n();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState<Record<string, string> | null>(null);
  const config = useMemo(() => loadAiConfig(sourceProfileId), [sourceProfileId]);
  const ready = Boolean(config.token && config.endpoint);

  const generate = async () => {
    setConfirmOpen(false);
    setError('');
    setLoading(true);
    try {
      const basic = loadRecords(profileId, 'basic');
      const shared = ['education', 'experience', 'projects', 'skills'].flatMap((section) =>
        loadRecords(profileId, section),
      );
      const context = buildTailoringContext(basic, shared, focus, targetDescription);
      const result = await tailorBasic(config, context, locale);
      if (!result.values['Professional Headline'] && !result.values['Professional Summary']) {
        throw new Error(t('tailorNoDraft'));
      }
      setProposal(result.values);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : t('tailorError'));
    } finally {
      setLoading(false);
    }
  };

  const save = () => {
    if (!proposal) return;
    const [first] = loadRecords(profileId, 'basic');
    const values = {
      ...(first?.values ?? {}),
      'Professional Headline': proposal['Professional Headline'] ?? '',
      'Professional Summary': proposal['Professional Summary'] ?? '',
    };
    saveRecord(
      profileId,
      first ? { ...first, values, updatedAt: new Date().toISOString() } : createRecord('basic', values),
    );
    setProposal(null);
  };

  return (
    <Paper sx={{ p: { xs: 2.5, md: 3 }, mb: 3, border: '1px solid #d8e2f0', bgcolor: '#fff' }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
        <AutoAwesomeRoundedIcon color="secondary" />
        <BoxCopy title={t('tailorTitle')} description={t('tailorDescription')} />
        <Button
          variant="contained"
          startIcon={<AutoAwesomeRoundedIcon />}
          disabled={!ready || loading}
          onClick={() => setConfirmOpen(true)}
          sx={{ ml: { sm: 'auto' }, flexShrink: 0 }}
        >
          {loading ? t('tailorGenerating') : t('tailorAction')}
        </Button>
      </Stack>
      {!ready && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {t('tailorNeedsAi')} <Link href={`/profiles/${sourceProfileId}/settings`}>{t('configureAiLink')}</Link>
        </Alert>
      )}
      {error && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
      {proposal && (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <Alert severity="info">{t('tailorReviewNotice')}</Alert>
          <TextField
            label={t('professionalHeadline')}
            value={proposal['Professional Headline'] ?? ''}
            onChange={(event) => setProposal({ ...proposal, 'Professional Headline': event.target.value })}
            fullWidth
          />
          <TextField
            label={t('professionalSummary')}
            value={proposal['Professional Summary'] ?? ''}
            onChange={(event) => setProposal({ ...proposal, 'Professional Summary': event.target.value })}
            multiline
            minRows={4}
            fullWidth
          />
          <Stack direction="row" spacing={1}>
            <Button variant="contained" onClick={save}>
              {t('confirmSave')}
            </Button>
            <Button onClick={() => setProposal(null)}>{t('discard')}</Button>
          </Stack>
        </Stack>
      )}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>{t('tailorConfirmTitle')}</DialogTitle>
        <DialogContent>
          <Typography>{t('tailorConfirmDescription')}</Typography>
          <Typography variant="body2" sx={{ mt: 1, overflowWrap: 'anywhere' }} color="text.secondary">
            {config.endpoint}
          </Typography>
          <Typography variant="body2" sx={{ mt: 2 }} color="text.secondary">
            {t('tailorDataNotice')}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>{t('cancel')}</Button>
          <Button variant="contained" onClick={generate}>
            {t('tailorSend')}
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
}

function BoxCopy({ title, description }: { title: string; description: string }) {
  return (
    <Stack sx={{ flex: 1 }}>
      <Typography fontWeight={800}>{title}</Typography>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}
