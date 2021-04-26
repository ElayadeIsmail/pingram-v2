export const getIdAsNumber = (id: string | string[]) => {
  if (Array.isArray(id)) {
    return typeof id[0] === 'string' ? parseInt(id[0]) : -1;
  }

  return typeof id === 'string' ? parseInt(id) : -1;
};
