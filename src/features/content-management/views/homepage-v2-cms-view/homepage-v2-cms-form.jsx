import { Controller, useFieldArray, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { CmsImageUploadField } from '../../components/CmsImageUploadField';
import { moveItem, ReorderControls } from '../../components/ReorderControls';

function SectionShell({ title, sectionKey, children }) {
  const { watch, setValue } = useFormContext();
  const visible = watch(`sections.${sectionKey}.visible`);
  const status = watch(`sections.${sectionKey}.status`);

  return (
    <Card variant="outlined" sx={{ p: { xs: 2, md: 3 } }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Typography variant="h6">{title}</Typography>
          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap">
            <FormControlLabel
              control={
                <Switch
                  checked={Boolean(visible)}
                  onChange={(e) => setValue(`sections.${sectionKey}.visible`, e.target.checked, {
                    shouldDirty: true,
                  })}
                />
              }
              label="Visible"
            />
            <TextField
              select
              size="small"
              label="Status"
              value={status ?? 'published'}
              sx={{ minWidth: 140 }}
              onChange={(e) =>
                setValue(`sections.${sectionKey}.status`, e.target.value, { shouldDirty: true })
              }
            >
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
            </TextField>
          </Stack>
        </Stack>
        <Divider />
        {children}
      </Stack>
    </Card>
  );
}

function TextRow({ name, label, multiline = false }) {
  const { register } = useFormContext();
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      multiline={multiline}
      minRows={multiline ? 3 : 1}
      {...register(name)}
    />
  );
}

export function HeroSectionEditor() {
  const { control, watch } = useFormContext();
  const images = watch('sections.hero.images') ?? [];

  return (
    <SectionShell title="Hero Section" sectionKey="hero">
      <Stack spacing={2}>
        <TextRow name="sections.hero.label" label="Small label" />
        <TextRow name="sections.hero.headline" label="Headline" />
        <TextRow name="sections.hero.description" label="Description" multiline />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextRow name="sections.hero.primaryButton.text" label="Primary button text" />
          <TextRow name="sections.hero.primaryButton.link" label="Primary link" />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextRow name="sections.hero.secondaryButton.text" label="Secondary button text" />
          <TextRow name="sections.hero.secondaryButton.link" label="Secondary link" />
        </Stack>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: 2,
          }}
        >
          {images.map((img, index) => (
            <Controller
              key={img.key ?? index}
              name={`sections.hero.images.${index}`}
              control={control}
              render={({ field }) => (
                <CmsImageUploadField
                  label={img.label ?? `Image ${index + 1}`}
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          ))}
        </Box>
      </Stack>
    </SectionShell>
  );
}

export function FeatureCardsEditor() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'sections.feature_cards.cards' });
  const cards = watch('sections.feature_cards.cards') ?? [];

  return (
    <SectionShell title="Benefits Cards" sectionKey="feature_cards">
      <Stack spacing={2}>
        <TextRow name="sections.feature_cards.eyebrow" label="Eyebrow" />
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="subtitle2">Card {index + 1}</Typography>
                <Stack direction="row" spacing={1}>
                  <ReorderControls
                    index={index}
                    total={cards.length}
                    onMoveUp={() =>
                      setValue('sections.feature_cards.cards', moveItem(cards, index, index - 1), {
                        shouldDirty: true,
                      })
                    }
                    onMoveDown={() =>
                      setValue('sections.feature_cards.cards', moveItem(cards, index, index + 1), {
                        shouldDirty: true,
                      })
                    }
                  />
                  <Button size="small" color="error" onClick={() => remove(index)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
              <TextRow name={`sections.feature_cards.cards.${index}.icon`} label="Icon (Iconify id)" />
              <TextRow name={`sections.feature_cards.cards.${index}.title`} label="Title" />
              <TextRow name={`sections.feature_cards.cards.${index}.description`} label="Description" multiline />
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          onClick={() =>
            append({
              id: `fc-${Date.now()}`,
              icon: 'solar:star-bold-duotone',
              title: 'New benefit',
              description: '',
            })
          }
        >
          Add card
        </Button>
      </Stack>
    </SectionShell>
  );
}

export function InstructorsEditor() {
  const { control, watch, setValue } = useFormContext();
  const images = watch('sections.instructors.images') ?? [];

  return (
    <SectionShell title="Instructor Showcase" sectionKey="instructors">
      <Stack spacing={2}>
        <TextRow name="sections.instructors.label" label="Label" />
        <TextRow name="sections.instructors.title" label="Title" />
        <TextRow name="sections.instructors.description" label="Description" multiline />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextRow name="sections.instructors.button.text" label="Button text" />
          <TextRow name="sections.instructors.button.link" label="Button link" />
        </Stack>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' }, gap: 2 }}>
          {images.map((img, index) => (
            <Stack key={img.id ?? index} spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="caption">{img.label}</Typography>
                <ReorderControls
                  index={index}
                  total={images.length}
                  onMoveUp={() =>
                    setValue('sections.instructors.images', moveItem(images, index, index - 1), {
                      shouldDirty: true,
                    })
                  }
                  onMoveDown={() =>
                    setValue('sections.instructors.images', moveItem(images, index, index + 1), {
                      shouldDirty: true,
                    })
                  }
                />
              </Stack>
              <Controller
                name={`sections.instructors.images.${index}`}
                control={control}
                render={({ field }) => (
                  <CmsImageUploadField label={img.label} value={field.value} onChange={field.onChange} />
                )}
              />
            </Stack>
          ))}
        </Box>
      </Stack>
    </SectionShell>
  );
}

export function StatisticsEditor() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'sections.stats.items' });
  const items = watch('sections.stats.items') ?? [];

  return (
    <SectionShell title="Statistics Banner" sectionKey="stats">
      <Stack spacing={2}>
        <TextRow name="sections.stats.eyebrow" label="Eyebrow" />
        <TextRow name="sections.stats.title" label="Title" />
        <TextRow name="sections.stats.year" label="Year (background)" />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextRow name="sections.stats.primaryValue" label="Primary metric" />
          <TextRow name="sections.stats.primaryLabel" label="Primary label" />
        </Stack>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextRow name="sections.stats.secondaryValue" label="Secondary metric" />
          <TextRow name="sections.stats.secondaryLabel" label="Secondary label" />
        </Stack>
        <TextRow name="sections.stats.watermarkText" label="Watermark text" />
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
            <Stack direction="row" spacing={2} alignItems="flex-start">
              <Stack spacing={1.5} flex={1}>
                <TextRow name={`sections.stats.items.${index}.label`} label="Label" />
                <TextRow name={`sections.stats.items.${index}.value`} label="Value" />
              </Stack>
              <ReorderControls
                index={index}
                total={items.length}
                onMoveUp={() =>
                  setValue('sections.stats.items', moveItem(items, index, index - 1), { shouldDirty: true })
                }
                onMoveDown={() =>
                  setValue('sections.stats.items', moveItem(items, index, index + 1), { shouldDirty: true })
                }
              />
              <Button size="small" color="error" onClick={() => remove(index)}>
                Delete
              </Button>
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          onClick={() => append({ id: `stat-${Date.now()}`, label: 'Metric', value: '0%' })}
        >
          Add statistic
        </Button>
      </Stack>
    </SectionShell>
  );
}

export function SuccessStoriesEditor() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'sections.success_stories.badges' });
  const badges = watch('sections.success_stories.badges') ?? [];

  return (
    <SectionShell title="Success Stories" sectionKey="success_stories">
      <Stack spacing={2}>
        <TextRow name="sections.success_stories.label" label="Label" />
        <TextRow name="sections.success_stories.title" label="Title" />
        <TextRow name="sections.success_stories.description" label="Description" multiline />
        <Controller
          name="sections.success_stories.groupImage"
          control={control}
          render={({ field }) => (
            <CmsImageUploadField label="Group photo" value={field.value} onChange={field.onChange} />
          )}
        />
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Badge {index + 1}</Typography>
                <Stack direction="row" spacing={1}>
                  <ReorderControls
                    index={index}
                    total={badges.length}
                    onMoveUp={() =>
                      setValue('sections.success_stories.badges', moveItem(badges, index, index - 1), {
                        shouldDirty: true,
                      })
                    }
                    onMoveDown={() =>
                      setValue('sections.success_stories.badges', moveItem(badges, index, index + 1), {
                        shouldDirty: true,
                      })
                    }
                  />
                  <Button size="small" color="error" onClick={() => remove(index)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
              <TextRow name={`sections.success_stories.badges.${index}.label`} label="Badge label" />
              <TextRow name={`sections.success_stories.badges.${index}.detail`} label="Detail" />
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <TextRow name={`sections.success_stories.badges.${index}.position.top`} label="Top %" />
                <TextRow name={`sections.success_stories.badges.${index}.position.left`} label="Left %" />
                <TextRow name={`sections.success_stories.badges.${index}.position.right`} label="Right %" />
                <TextRow name={`sections.success_stories.badges.${index}.position.bottom`} label="Bottom %" />
              </Stack>
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          onClick={() =>
            append({
              id: `b-${Date.now()}`,
              label: 'TOP',
              detail: '0%',
              position: { top: '10%', left: '5%' },
            })
          }
        >
          Add badge
        </Button>
      </Stack>
    </SectionShell>
  );
}

export function HowItWorksEditor() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'sections.how_it_works.steps' });
  const steps = watch('sections.how_it_works.steps') ?? [];

  return (
    <SectionShell title="How It Works" sectionKey="how_it_works">
      <Stack spacing={2}>
        <TextRow name="sections.how_it_works.eyebrow" label="Eyebrow" />
        <TextRow name="sections.how_it_works.title" label="Title" />
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Step {index + 1}</Typography>
                <Stack direction="row" spacing={1}>
                  <ReorderControls
                    index={index}
                    total={steps.length}
                    onMoveUp={() =>
                      setValue('sections.how_it_works.steps', moveItem(steps, index, index - 1), {
                        shouldDirty: true,
                      })
                    }
                    onMoveDown={() =>
                      setValue('sections.how_it_works.steps', moveItem(steps, index, index + 1), {
                        shouldDirty: true,
                      })
                    }
                  />
                  <Button size="small" color="error" onClick={() => remove(index)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
              <TextRow name={`sections.how_it_works.steps.${index}.number`} label="Number" />
              <TextRow name={`sections.how_it_works.steps.${index}.title`} label="Title" />
              <TextRow name={`sections.how_it_works.steps.${index}.description`} label="Description" multiline />
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(watch(`sections.how_it_works.steps.${index}.imageFirst`))}
                    onChange={(e) =>
                      setValue(`sections.how_it_works.steps.${index}.imageFirst`, e.target.checked, {
                        shouldDirty: true,
                      })
                    }
                  />
                }
                label="Image on left"
              />
              <Controller
                name={`sections.how_it_works.steps.${index}.image`}
                control={control}
                render={({ field: imgField }) => (
                  <CmsImageUploadField label="Step image" value={imgField.value} onChange={imgField.onChange} />
                )}
              />
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          onClick={() =>
            append({
              id: `step-${Date.now()}`,
              number: String(steps.length + 1),
              title: 'New step',
              description: '',
              imageFirst: false,
              image: { label: 'Step preview', alt: '', url: null, mediaId: null },
            })
          }
        >
          Add step
        </Button>
      </Stack>
    </SectionShell>
  );
}

export function FeaturedContentEditor() {
  const { control, watch, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({ control, name: 'sections.featured_content.items' });
  const items = watch('sections.featured_content.items') ?? [];

  return (
    <SectionShell title="Featured Content" sectionKey="featured_content">
      <Stack spacing={2}>
        <TextRow name="sections.featured_content.eyebrow" label="Eyebrow" />
        <TextRow name="sections.featured_content.title" label="Title" />
        <TextRow name="sections.featured_content.description" label="Description" multiline />
        {fields.map((field, index) => (
          <Card key={field.id} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="subtitle2">Item {index + 1}</Typography>
                <Stack direction="row" spacing={1}>
                  <ReorderControls
                    index={index}
                    total={items.length}
                    onMoveUp={() =>
                      setValue('sections.featured_content.items', moveItem(items, index, index - 1), {
                        shouldDirty: true,
                      })
                    }
                    onMoveDown={() =>
                      setValue('sections.featured_content.items', moveItem(items, index, index + 1), {
                        shouldDirty: true,
                      })
                    }
                  />
                  <Button size="small" color="error" onClick={() => remove(index)}>
                    Delete
                  </Button>
                </Stack>
              </Stack>
              <TextRow name={`sections.featured_content.items.${index}.title`} label="Title" />
              <TextRow name={`sections.featured_content.items.${index}.description`} label="Description" multiline />
              <TextRow name={`sections.featured_content.items.${index}.videoUrl`} label="Video URL" />
              <Controller
                name={`sections.featured_content.items.${index}.thumbnail`}
                control={control}
                render={({ field: thumbField }) => (
                  <CmsImageUploadField label="Thumbnail" value={thumbField.value} onChange={thumbField.onChange} />
                )}
              />
            </Stack>
          </Card>
        ))}
        <Button
          variant="outlined"
          onClick={() =>
            append({
              id: `fv-${Date.now()}`,
              title: 'New video',
              description: '',
              videoUrl: '',
              thumbnail: { label: 'Thumbnail', alt: '', url: null, mediaId: null },
            })
          }
        >
          Add video
        </Button>
      </Stack>
    </SectionShell>
  );
}
