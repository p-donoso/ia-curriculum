'use client';

import { useState } from 'react';
import { Box, Button, Paper, Stack, TextField, Typography } from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import { loadAiConfig } from '../../lib/ai/config';
import { extractRecord, type StructuredProposal } from '../../lib/ai/extraction';
import { sections } from '../../lib/profiles/sections';
import { useI18n } from '../i18n';

export type Proposal = StructuredProposal & { source: string };

export function CareerCoach({
  section,
  title,
  fields,
  profileId,
  onProposal,
}: {
  section: string;
  title: string;
  fields: string[];
  profileId?: string;
  onProposal: (proposal: Proposal) => void;
}) {
  const { t } = useI18n();
  const [text, setText] = useState('');
  const [questions, setQuestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  async function propose() {
    const source = text.trim();
    if (!source) return;
    setLoading(true);
    setError('');
    try {
      const config = loadAiConfig(profileId);
      const proposal =
        config.token && config.endpoint
          ? await extractRecord(config, sections[section].title, fields, source)
          : {
              values: Object.fromEntries(fields.map((field) => [field, ''])),
              missing: fields,
              confidence: 'low' as const,
            };
      onProposal({ ...proposal, source });
      setText('');
    } catch {
      setError(t('providerError'));
      onProposal({
        values: Object.fromEntries(fields.map((field) => [field, ''])),
        missing: fields,
        confidence: 'low',
        source,
      });
    } finally {
      setLoading(false);
    }
  }
  return (
    <Paper sx={{ p: 2.5, mb: 3, border: '1px solid #dbe3f0', background: 'linear-gradient(135deg,#f3f5ff,#fff)' }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
        <AutoAwesomeRoundedIcon color="secondary" />
        <Box>
          <Typography fontWeight={800}>{t('assistant')}</Typography>
          <Typography variant="caption" color="text.secondary">
            {t('tellAbout')} {title.toLowerCase()}.
          </Typography>
        </Box>
      </Stack>
      <TextField
        fullWidth
        multiline
        minRows={3}
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={t('writeHere')}
      />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 1.5 }}>
        <Button variant="contained" disabled={!text.trim() || loading} onClick={propose}>
          {loading ? t('analyzing') : t('prepareProposal')}
        </Button>
        <Button variant="outlined" onClick={() => setQuestions(!questions)} startIcon={<AutoAwesomeRoundedIcon />}>
          {questions ? t('hideQuestions') : t('deeperQuestions')}
        </Button>
      </Stack>
      {error && (
        <Typography role="status" color="warning.dark" sx={{ mt: 1 }}>
          {error}
        </Typography>
      )}
      {questions && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#fff', borderRadius: 2 }}>
          <Typography variant="body2" fontWeight={700}>
            {t('toComplement')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {t('resultQuestion')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {t('personalQuestion')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {t('learnedQuestion')}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
