/**
 * Dynamic Cards Loader for Latest Insights & Client Success Stories
 * Fetches latest live posts from the Next.js /resources API while preserving
 * static HTML fallbacks for maximum performance, SEO, and zero layout shift.
 */

(function () {
  'use strict';

  // Base API configuration
  const API_ENDPOINT = '/resources/api/posts';
  const FALLBACK_HOST = 'https://www.vjcpartners.com';

  /**
   * Cleans and sanitizes post excerpt HTML string
   */
  function cleanExcerpt(rawHtml) {
    if (!rawHtml) return '';
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = rawHtml;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text
      .replace(/Greetings from VJC India!?/gi, 'Greetings from VJC Partners!')
      .replace(/VJC India/gi, 'VJC Partners')
      .trim();
  }

  /**
   * Formats ISO date string to localized readable date (e.g. "Jul 14, 2026")
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  }

  /**
   * Fetches posts for a given category and limit
   */
  async function fetchPosts(category, limit = 3) {
    const params = new URLSearchParams({
      category: category,
      limit: String(limit)
    });

    const urls = [
      `${API_ENDPOINT}?${params.toString()}`,
      `${FALLBACK_HOST}${API_ENDPOINT}?${params.toString()}`
    ];

    for (const url of urls) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
          const data = await response.json();
          if (Array.isArray(data.posts) && data.posts.length > 0) {
            return data.posts;
          }
        }
      } catch (err) {
        // Try next fallback URL
      }
    }
    return null;
  }

  /**
   * Generates HTML string for a single post/case study card
   */
  function renderCard(post, type) {
    const isCaseStudy = type === 'case-studies' || (post.categories?.nodes || []).some(cat => cat.slug === 'case-studies');
    const href = isCaseStudy
      ? `https://www.vjcpartners.com/resources/case-studies/${post.slug}`
      : `https://www.vjcpartners.com/resources/posts/${post.slug}`;

    const title = post.title || 'Untitled Post';
    const author = post.author?.node?.name || 'Kate';
    const dateFormatted = formatDate(post.date);
    const excerpt = cleanExcerpt(post.excerpt);
    const imgUrl = post.featuredImage?.node?.sourceUrl || '';
    const imgAlt = post.featuredImage?.node?.altText || title;

    const categories = post.categories?.nodes || [];
    const tags = post.tags?.nodes || [];
    const pills = [...categories, ...tags].slice(0, 3);

    const imageHtml = imgUrl
      ? `<div class="overflow-hidden rounded-[1rem]">
           <img src="${imgUrl}" alt="${imgAlt.replace(/"/g, '&quot;')}" width="400" height="160" class="w-full h-40 sm:h-[12svw] 2xl:h-[25svh] object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
         </div>`
      : '';

    const metaHtml = isCaseStudy
      ? `<p class="text-sm text-darkBlue mt-1">
           <span class="sr-only">Author: </span>
           By <span class="font-medium">${author}</span>
           ${dateFormatted ? `<span aria-hidden="true"> &bull; </span><time dateTime="${post.date}" class="font-light">${dateFormatted}</time>` : ''}
         </p>`
      : `<p class="text-[13px] font-bold uppercase tracking-wide text-darkBlue mt-1">
           ${categories[0]?.name || 'Insights'} &bull; By ${author}
         </p>`;

    const pillsHtml = pills.length > 0
      ? `<div class="flex flex-wrap gap-1.5 mt-3">
           ${pills.map(p => `<span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide bg-darkBlue/10 text-darkBlue border border-darkBlue/20">${p.name}</span>`).join('')}
         </div>`
      : '';

    return `
      <article class="bg-white p-6 rounded-[2.5rem] shadow-[0px_7px_20px_0px_rgba(138,43,226,0.4)] hover:scale-105 transition-transform flex flex-col justify-between h-full" role="listitem" aria-labelledby="post-title-${post.slug}">
        <a href="${href}" class="block focus:outline-none focus:ring-2 focus:ring-darkGreen focus:ring-offset-2 group h-full flex flex-col justify-between" aria-label="Read more about ${title.replace(/"/g, '&quot;')}">
          <div>
            ${imageHtml}
            <h3 id="post-title-${post.slug}" class="mt-3 text-base font-bold text-darkBlue uppercase leading-snug">
              ${title}
            </h3>
            ${metaHtml}
            ${excerpt ? `<div class="text-sm text-darkBlue mt-2 font-light line-clamp-5">${excerpt}</div>` : ''}
          </div>
          ${pillsHtml}
        </a>
      </article>
    `;
  }

  /**
   * Loads and renders dynamic posts into specified DOM container
   */
  async function loadContainer(container, category, type) {
    if (!container) return;
    const posts = await fetchPosts(category, 3);
    if (!posts || posts.length === 0) return; // Keep existing static HTML fallback

    const newHtml = posts.map(post => renderCard(post, type)).join('');
    container.innerHTML = newHtml;
  }

  /**
   * Initializes all dynamic card sections on the page
   */
  function init() {
    const insightsContainers = document.querySelectorAll('[data-dynamic-posts="insights"], #latest-insights-grid');
    insightsContainers.forEach(container => loadContainer(container, 'insights', 'posts'));

    const caseStudiesContainers = document.querySelectorAll('[data-dynamic-posts="case-studies"], #client-success-grid');
    caseStudiesContainers.forEach(container => loadContainer(container, 'case-studies', 'case-studies'));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
