'use client';

import { Button, Chip, Divider, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import { resolveSystemPrompts, systemPromptSeeds, type SystemPromptId } from '../../lib/ai/prompts';
import type { ProviderConfig } from '../../lib/ai/config';
import { useI18n } from '../i18n';

type SettingsPanelProps = {
  config: ProviderConfig;
  profileId?: string;
  saved: boolean;
  ready: boolean;
  onConfigChange: (config: ProviderConfig) => void;
  onSave: () => void;
  onDownload: () => void;
  onDelete: () => void;
};

/** Profile-scoped provider, prompt, and local-data controls. */
export function SettingsPanel({
  config,
  profileId,
  saved,
  ready,
  onConfigChange,
  onSave,
  onDownload,
  onDelete,
}: SettingsPanelProps) {
  const { locale, t } = useI18n();

  const updatePrompt = (id: SystemPromptId, value: string) => {
    const prompts = resolveSystemPrompts(config.systemPrompts);
    onConfigChange({ ...config, systemPrompts: { ...prompts, [locale]: { ...prompts[locale], [id]: value } } });
  };

  const resetPrompts = () => {
    if (!ready) return;
    const prompts = resolveSystemPrompts(config.systemPrompts);
    onConfigChange({ ...config, systemPrompts: { ...prompts, [locale]: { ...systemPromptSeeds[locale] } } });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography fontWeight={800} sx={{ mb: 2 }}>
        {t('providerAi')}
      </Typography>
      <TextField
        select
        fullWidth
        label={t('provider')}
        value={config.provider}
        onChange={(event) => onConfigChange({ ...config, provider: event.target.value })}
      >
        <MenuItem value="openai-compatible">OpenAI-compatible API</MenuItem>
        <MenuItem value="local">Local OpenAI-compatible server</MenuItem>
        <MenuItem value="custom">Custom OpenAI-compatible API</MenuItem>
      </TextField>
      <TextField
        fullWidth
        label={t('baseUrl')}
        value={config.endpoint}
        onChange={(event) => onConfigChange({ ...config, endpoint: event.target.value })}
        placeholder="https://provider.example/v1"
        helperText={t('providerHelp')}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        label={t('model')}
        value={config.model}
        onChange={(event) => onConfigChange({ ...config, model: event.target.value })}
        sx={{ mt: 2 }}
      />
      <TextField
        fullWidth
        type="password"
        label={t('token')}
        value={config.token}
        onChange={(event) => onConfigChange({ ...config, token: event.target.value })}
        sx={{ mt: 2 }}
        autoComplete="new-password"
        helperText={t('tokenHelp')}
      />
      <Button variant="outlined" sx={{ mt: 2 }} onClick={onSave}>
        {t('saveConfig')}
      </Button>
      {saved && <Chip label={t('configSaved')} color="success" sx={{ ml: 2 }} />}
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" fontWeight={800}>
        {t('systemPrompts')}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        {t('systemPromptsHelp')}
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={6}
        label={t('guidedReflectionPrompt')}
        value={config.systemPrompts?.[locale]?.guidedReflection ?? systemPromptSeeds[locale].guidedReflection}
        onChange={(event) => updatePrompt('guidedReflection', event.target.value)}
        slotProps={{ htmlInput: { readOnly: !ready } }}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        multiline
        minRows={5}
        label={t('recordExtractionPrompt')}
        value={config.systemPrompts?.[locale]?.recordExtraction ?? systemPromptSeeds[locale].recordExtraction}
        onChange={(event) => updatePrompt('recordExtraction', event.target.value)}
        slotProps={{ htmlInput: { readOnly: !ready } }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={resetPrompts}>
          {t('resetPromptSeeds')}
        </Button>
        <Button variant="outlined" onClick={onSave}>
          {t('saveConfig')}
        </Button>
        {saved && <Chip label={t('configSaved')} color="success" />}
      </Stack>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" fontWeight={800}>
        {t('yourData')}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5 }}>
        {t('dataHelp')}
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mt: 2 }}>
        <Button variant="outlined" startIcon={<DownloadRoundedIcon />} onClick={onDownload} disabled={!profileId}>
          {t('exportProfile')}
        </Button>
        <Button color="error" startIcon={<DeleteOutlineRoundedIcon />} onClick={onDelete} disabled={!profileId}>
          {t('deleteProfile')}
        </Button>
      </Stack>
    </Paper>
  );
}
