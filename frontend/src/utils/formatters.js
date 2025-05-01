export const formatAddress = (address) => {
    if (!address) return 'No address';
    const parts = [
      address.street,
      address.area,
      address.landmark,
      address.city,
      address.postalCode
    ].filter(Boolean);
    return parts.join(', ');
  };