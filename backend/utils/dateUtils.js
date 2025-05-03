export const getTimeframeFilter = (timeframe) => {
    const now = new Date();
    const startDate = new Date();
  
    switch (timeframe) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 1); // default to month
    }
  
    return {
      $gte: startDate,
      $lte: now
    };
  };