import { useMemo, useState, useEffect } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useLmsUser } from 'src/hooks/use-lms';

import { getInstructorNameInitials } from 'src/features/instructor-profile/instructor-profile-data';
import { InstructorWorkspaceShell } from 'src/features/instructor-profile/components/instructor-workspace-shell';

import { toast } from 'src/components/snackbar';

import { styles } from './styles';
import { getInstructorSettingsInitialValues } from '../../instructor-settings-defaults';
import { InstructorSettingsBannerAvatar } from '../../components/instructor-settings-banner-avatar';
import { InstructorSettingsProfileFields } from '../../components/instructor-settings-profile-fields';
import { InstructorSettingsSocialsFields } from '../../components/instructor-settings-socials-fields';
import { InstructorSettingsPasswordFields } from '../../components/instructor-settings-password-fields';

function buildDisplayOptions(firstName, lastName) {
  const fullName = `${firstName} ${lastName}`.trim();
  const firstNameOnly = firstName || 'Instructor';
  const initialFormat = lastName
    ? `${firstName} ${lastName.charAt(0).toUpperCase()}.`
    : firstNameOnly;

  return [fullName, firstNameOnly, initialFormat].filter(
    (option, index, items) => option && items.indexOf(option) === index
  );
}

export function InstructorSettingsView() {
  const { user } = useLmsUser();
  const [values, setValues] = useState(() => getInstructorSettingsInitialValues(user));

  useEffect(() => {
    setValues((current) => ({
      ...getInstructorSettingsInitialValues(user),
      newPassword: current.newPassword,
      repeatPassword: current.repeatPassword,
    }));
  }, [user]);

  const displayOptions = useMemo(
    () => buildDisplayOptions(values.firstName, values.lastName),
    [values.firstName, values.lastName]
  );

  const profileInitials = useMemo(
    () => getInstructorNameInitials(values.displayName),
    [values.displayName]
  );

  const handleChange = (field, nextValue) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
  };

  const handleSave = (event) => {
    event.preventDefault();
    if (values.newPassword && values.newPassword !== values.repeatPassword) {
      toast.error('New password and repeat password do not match.');
      return;
    }
    toast.success('Profile changes saved (demo).');
  };

  return (
    <InstructorWorkspaceShell>
      <Stack spacing={4} component="form" onSubmit={handleSave}>
        <Typography variant="h3" sx={styles.pageTitle}>
          Profile
        </Typography>

        <InstructorSettingsBannerAvatar initials={profileInitials} />

        <InstructorSettingsProfileFields
          values={values}
          displayOptions={displayOptions}
          onChange={handleChange}
        />

        <InstructorSettingsSocialsFields values={values} onChange={handleChange} />

        <InstructorSettingsPasswordFields values={values} onChange={handleChange} />

        <Button type="submit" variant="contained" sx={styles.saveButton}>
          Save Changes
        </Button>
      </Stack>
    </InstructorWorkspaceShell>
  );
}
