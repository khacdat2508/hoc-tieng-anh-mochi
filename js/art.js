// Hình vẽ SVG cho chủ đề Gia đình (emoji người khó phân biệt với bé).
// Mỗi nhân vật có một nét riêng dễ nhận: tóc dài, râu, kính, búi tóc, tóc tết...
(function () {
  const SKIN = '#f7cfa6';
  const SKIN2 = '#ecb98d';
  const HAIR = '#2e2a33';
  const GRAY = '#e4e4ea';
  const GRAY_LINE = 'stroke="#b4b4c2" stroke-width="2.5"';
  const INK = '#3a2a3a';

  const neck = `<rect x="88" y="126" width="24" height="28" rx="8" fill="${SKIN2}"/>`;
  const body = c => `<path d="M34 200C34 162 62 146 100 146s66 16 66 54z" fill="${c}"/>`;
  const ears = `<circle cx="55" cy="100" r="10" fill="${SKIN2}"/><circle cx="145" cy="100" r="10" fill="${SKIN2}"/>`;
  const face = `<circle cx="100" cy="96" r="46" fill="${SKIN}"/>`;
  const eyes = `<ellipse cx="83" cy="99" rx="5.5" ry="7" fill="${INK}"/><ellipse cx="117" cy="99" rx="5.5" ry="7" fill="${INK}"/>` +
    `<circle cx="85" cy="96" r="2" fill="#fff"/><circle cx="119" cy="96" r="2" fill="#fff"/>`;
  const cheeks = `<ellipse cx="72" cy="114" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/><ellipse cx="128" cy="114" rx="8" ry="5" fill="#ff8fa3" opacity=".55"/>`;
  const smile = (c = '#9b3d3d') => `<path d="M89 117q11 10 22 0" fill="none" stroke="${c}" stroke-width="4" stroke-linecap="round"/>`;
  const brows = (c, w = 3.5) => `<path d="M75 85q8-4 16 0M109 85q8-4 16 0" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`;
  const glasses = `<g fill="none" stroke="#7a5638" stroke-width="3.5"><circle cx="83" cy="99" r="13"/><circle cx="117" cy="99" r="13"/><path d="M96 98q4-4 8 0"/></g>`;
  const head = mouth => ears + face + eyes + cheeks + mouth;

  const mommy =
    `<path d="M50 96C44 52 70 36 100 36s56 16 50 60l2 60H48z" fill="${HAIR}"/>` +
    neck + body('#ff8fb1') + head(smile('#d6455f')) + brows(HAIR, 3) +
    `<path d="M53 98C50 58 74 44 100 44s50 14 47 54c-7-16-19-26-35-30-8 10-28 16-48 18-4 4-8 8-11 12z" fill="${HAIR}"/>` +
    `<path d="M50 90c-6 30-4 60 6 82l20-4c-10-28-12-53-10-72zM150 90c6 30 4 60-6 82l-20-4c10-28 12-53 10-72z" fill="${HAIR}"/>` +
    `<circle cx="66" cy="124" r="4" fill="#ffd166"/><circle cx="134" cy="124" r="4" fill="#ffd166"/>`;

  const daddy =
    neck + body('#4a90e2') +
    `<path d="M80 147l20 20-8 7-18-22zM120 147l-20 20 8 7 18-22z" fill="#fff"/>` +
    head(smile()) + brows(HAIR, 5.5) +
    `<path d="M53 96C48 56 74 40 100 40s54 16 47 56c-3-14-9-24-19-28-16 6-42 6-58 0-8 6-14 16-17 28z" fill="${HAIR}"/>`;

  const baby =
    `<path d="M48 200c0-30 24-44 52-44s52 14 52 44z" fill="#ffd166"/>` +
    `<path d="M80 164h40l-6 18H86z" fill="#fff" opacity=".85"/>` +
    `<g transform="translate(100 102) scale(1.14) translate(-100 -96)">` +
    ears + face + eyes + cheeks +
    `<ellipse cx="100" cy="119" rx="6.5" ry="5.5" fill="#c0505a"/>` +
    `<path d="M97 52c-10-10 6-22 15-11" fill="none" stroke="${HAIR}" stroke-width="5" stroke-linecap="round"/>` +
    `</g>`;

  const grandma =
    `<circle cx="100" cy="42" r="20" fill="${GRAY}" ${GRAY_LINE}/>` +
    neck + body('#a78bfa') + head(smile()) + brows('#9a9aaa', 3) +
    `<path d="M53 98C48 58 74 46 100 46s52 12 47 52c-5-20-21-32-47-32S58 78 53 98z" fill="${GRAY}" ${GRAY_LINE}/>` +
    glasses;

  const grandpa =
    neck + body('#a47551') + head(`<path d="M90 123q10 8 20 0" fill="none" stroke="#9b3d3d" stroke-width="4" stroke-linecap="round"/>`) +
    `<ellipse cx="86" cy="64" rx="11" ry="5" fill="#fff" opacity=".45"/>` +
    `<path d="M52 104c-4-20 2-34 12-40-2 14-2 28 0 40zM148 104c4-20-2-34-12-40 2 14 2 28 0 40z" fill="${GRAY}" ${GRAY_LINE}/>` +
    brows('#9a9aaa', 5.5) + glasses +
    `<path d="M82 116c6-10 16-8 18-4 2-4 12-6 18 4-8 4-14 0-18 0s-10 4-18 0z" fill="${GRAY}" ${GRAY_LINE}/>`;

  const brother =
    neck + body('#34c38f') +
    `<path d="M70 160h60" stroke="#fff" stroke-width="6" opacity=".6"/>` +
    head(smile()) + brows(HAIR, 4) +
    `<path d="M53 96c-3-22 3-34 9-38l4-18 14 12 8-18 12 14 12-14 8 18 14-12 4 18c6 4 12 16 9 38-7-18-23-28-47-28S60 78 53 96z" fill="${HAIR}"/>`;

  const sister =
    `<circle cx="44" cy="110" r="19" fill="${HAIR}"/><circle cx="156" cy="110" r="19" fill="${HAIR}"/>` +
    neck + body('#ffb703') + head(smile('#d6455f')) + brows(HAIR, 3) +
    `<path d="M53 98C48 58 74 44 100 44s52 14 47 54c-7-16-21-26-41-28-10 6-26 10-40 12-6 4-10 10-13 16z" fill="${HAIR}"/>` +
    `<path d="M50 84L36 74l2 20zM50 84l14-10-2 20zM150 84l14-10-2 20zM150 84l-14-10 2 20z" fill="#ef476f"/>` +
    `<circle cx="50" cy="84" r="5" fill="#d62f58"/><circle cx="150" cy="84" r="5" fill="#d62f58"/>`;

  const family =
    `<path d="M100 18c-8-14-28-10-24 6 4 12 24 20 24 20s20-8 24-20c4-16-16-20-24-6z" fill="#ef476f"/>` +
    `<g transform="translate(-4 46) scale(.6)">${daddy}</g>` +
    `<g transform="translate(84 46) scale(.6)">${mommy}</g>` +
    `<g transform="translate(50 92) scale(.54)">${sister}</g>`;

  window.ART_SVG = { mommy, daddy, baby, grandma, grandpa, brother, sister, family };
})();
