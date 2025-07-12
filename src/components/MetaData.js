'use client';

import Head from 'next/head';

export default function MetaData({ title, description }) {
  const baseTitle = 'TripKnock Admin';
  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description || 'TripKnock Admin Panel - Manage your travel business efficiently'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || 'TripKnock Admin Panel - Manage your travel business efficiently'} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || 'TripKnock Admin Panel - Manage your travel business efficiently'} />
    </Head>
  );
}
