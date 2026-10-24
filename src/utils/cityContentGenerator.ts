export interface CityData {
  city: string;
  state: string;
  county: string;
  zip_codes: string[];
  lat: number;
  lng: number;
}

export interface StateData {
  code: string;
  name: string;
  slug: string;
  capital: string;
  climateOverview: string;
  commonFurnaceIssues: string;
  licensingBody: string;
  licensingUrl: string;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generates varied H1 headlines
export function getCityH1(cityName: string, stateName: string, index: number): string {
  const patterns = [
    `Same Day Furnace Repair in ${cityName}, ${stateName}`,
    `Emergency Furnace & Heating Repair in ${cityName}, ${stateName}`,
    `${cityName}, ${stateName} Same Day Furnace Repair & Heating Diagnostics`,
    `24/7 Furnace Repair & Heating Restoration in ${cityName}, ${stateName}`,
    `Rapid Same Day Furnace Repair Specialists in ${cityName}, ${stateName}`
  ];
  return patterns[index % patterns.length];
}

// Generates varied opening paragraphs (50-80 words)
export function getCityOpening(cityName: string, stateName: string, county: string, index: number): string {
  const openings = [
    `When unexpected winter chills hit ${cityName}, a malfunctioning furnace can rapidly transform a comfortable home into an urgent safety hazard. FurnaceFix Pros delivers rapid same-day furnace repair across ${county || cityName} with experienced local technicians ready to troubleshoot ignition lockouts, noisy blowers, and sudden heating failures. We bring fully equipped service vehicles and transparent upfront pricing directly to your doorstep.`,
    `Nothing disrupts peace of mind faster than a heating system shutting down in the middle of a sub-freezing night in ${cityName}. Our certified heating specialists provide round-the-clock emergency furnace repairs across ${cityName} and surrounding ${stateName} neighborhoods. From stubborn pilot outages to worn blower capacitors, we pinpoint the mechanical failure quickly and restore reliable warmth on the initial service visit.`,
    `Facing cold air blowing from your heating vents in ${cityName}? FurnaceFix Pros provides responsive, same-day furnace diagnostic and repair services designed to get your heat flowing before temperatures drop further. Our local ${stateName} heating contractors arrive equipped with genuine OEM replacement components, clear flat-rate quotes, and comprehensive safety testing to keep your household safe throughout the coldest winter months.`,
    `During severe temperature drops across ${stateName}, residential heating systems in ${cityName} endure continuous thermal stress that exposes aging igniters and clogged flame sensors. FurnaceFix Pros is your trusted neighborhood heating partner, providing 24/7 emergency dispatch and precision furnace repairs throughout ${county || cityName}. We diagnose the root cause accurately, explain your repair options clearly, and guarantee all parts and labor.`,
    `If your furnace is cycling on and off repeatedly or refusing to ignite altogether in ${cityName}, immediate professional attention is essential to prevent frozen pipes and carbon monoxide risks. FurnaceFix Pros pairs localized technical expertise with prompt same-day service across ${cityName}, delivering upfront pricing, certified technician workmanship, and lasting heating dependability.`
  ];
  return openings[index % openings.length];
}

// Generates nearby cities links in the same state
export function getNearbyCities(allCities: CityData[], currentCity: CityData): CityData[] {
  const sameState = allCities.filter(c => c.state === currentCity.state && c.city !== currentCity.city);
  if (sameState.length <= 3) return sameState;

  // Sort by geographic distance if coordinates exist
  return sameState.sort((a, b) => {
    const distA = Math.hypot((a.lat || 0) - (currentCity.lat || 0), (a.lng || 0) - (currentCity.lng || 0));
    const distB = Math.hypot((b.lat || 0) - (currentCity.lat || 0), (b.lng || 0) - (currentCity.lng || 0));
    return distA - distB;
  }).slice(0, 3);
}
