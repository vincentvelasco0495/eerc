// Initial / demo field values; merge with `useLmsUser()` in the view

export const instructorSettingsDemo = {
  position: 'Professor of Business Administration',
  bio: 'I help professionals build clear thinking habits and turn complex topics into teachable, repeatable lessons.',
  facebook: 'https://www.facebook.com/',
  linkedin: 'https://www.linkedin.com/in/',
  twitter: 'https://x.com/',
  instagram: 'https://www.instagram.com/',
};

export function getInstructorSettingsInitialValues(user) {
  const displayName = user?.displayName || 'Demo Instructor';
  const [first = 'Demo', ...rest] = displayName.split(' ');
  const last = rest.join(' ') || 'Instructor';

  return {
    firstName: first,
    lastName: last,
    position: instructorSettingsDemo.position,
    bio: instructorSettingsDemo.bio,
    displayName,
    facebook: instructorSettingsDemo.facebook,
    linkedin: instructorSettingsDemo.linkedin,
    twitter: instructorSettingsDemo.twitter,
    instagram: instructorSettingsDemo.instagram,
    newPassword: '',
    repeatPassword: '',
  };
}
