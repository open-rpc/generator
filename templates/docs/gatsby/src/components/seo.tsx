/**
 * SEO component that queries for data with
 *  Gatsby's useStaticQuery React hook
 *
 * See: https://www.gatsbyjs.org/docs/use-static-query/
 */

import React from 'react';
import { useStaticQuery, graphql } from 'gatsby';

interface SEOProps {
  description?: string;
  lang?: string;
  meta?: Array<{ name: string; content: string }>;
  title?: string;
  image?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SEO({ description = '', lang = 'en', meta = [], title, image }: SEOProps) {
  const { site } = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
          description
          author
          siteUrl
        }
      }
    }
  `);

  const metaDescription = description || site.siteMetadata.description;
  const defaultTitle = site.siteMetadata?.title;
  const metaImage =
    image && site.siteMetadata.siteUrl ? `${site.siteMetadata.siteUrl}${image}` : null;

  // Instead of returning a Helmet component, we directly return the elements
  return (
    <>
      <title>{title ? `${title} | ${defaultTitle}` : defaultTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:type" content="website" />
      {metaImage && <meta property="og:image" content={metaImage} />}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:creator" content={site.siteMetadata?.author || ''} />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta name="twitter:description" content={metaDescription} />
      {metaImage && <meta name="twitter:image" content={metaImage} />}
      {meta.map(({ name, content }, i) => (
        <meta key={i} name={name} content={content} />
      ))}
    </>
  );
}

// This is the component that will be used by Gatsby's Head API
export const Head = SEO;
