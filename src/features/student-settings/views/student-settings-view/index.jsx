import { useMemo, useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useLmsUser } from 'src/hooks/use-lms';

import { StudentWorkspaceShell } from 'src/features/student-profile/components/student-workspace-shell';

import { styles } from './styles';
import { StudentSettingsAvatarPanel } from '../../components/student-settings-avatar-panel';
import { StudentSettingsProfileFields } from '../../components/student-settings-profile-fields';
import { StudentSettingsPasswordFields } from '../../components/student-settings-password-fields';

function splitName(displayName = '') {
  const [firstName = '', ...rest] = displayName.split(' ');

  return {
    firstName,
    lastName: rest.join(' '),
  };
}

export function StudentSettingsView() {
  const { user } = useLmsUser();
  const nameParts = useMemo(() => splitName(user?.displayName), [user?.displayName]);

  const [values, setValues] = useState({
    firstName: nameParts.firstName || 'Henry',
    lastName: nameParts.lastName || 'Martin',
    displayName: user?.displayName || 'Henry Martin',
    newPassword: '',
    repeatPassword: '',
  });

  const displayOptions = useMemo(() => {
    const fullName = `${values.firstName} ${values.lastName}`.trim();
    const firstNameOnly = values.firstName || 'Student';
    const initialFormat = values.lastName
      ? `${values.firstName} ${values.lastName.charAt(0).toUpperCase()}.`
      : firstNameOnly;

    return [fullName, firstNameOnly, initialFormat].filter(
      (option, index, items) => option && items.indexOf(option) === index
    );
  }, [values.firstName, values.lastName]);

  const initials = `${values.firstName?.[0] ?? ''}${values.lastName?.[0] ?? ''}`.toUpperCase();

  const handleChange = (field, nextValue) => {
    setValues((current) => ({ ...current, [field]: nextValue }));
  };

  return (
    <StudentWorkspaceShell>
      <Stack spacing={4}>
        <Typography variant="h3" sx={styles.pageTitle}>
          Profile
        </Typography>

        <StudentSettingsAvatarPanel initials={initials} />

        <StudentSettingsProfileFields
          values={values}
          displayOptions={displayOptions}
          onChange={handleChange}
        />

        <StudentSettingsPasswordFields values={values} onChange={handleChange} />

        <Button variant="contained" sx={styles.saveButton}>
          Save Changes
        </Button>
      </Stack>
    </StudentWorkspaceShell>
  );
}
