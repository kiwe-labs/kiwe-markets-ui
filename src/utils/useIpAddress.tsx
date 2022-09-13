import { useEffect, useState } from 'react';

const SANCTIONED_COUNTRIES = [
  ['AG', 'Antigua and Barbuda'],
  ['DZ', 'Algeria'],
  ['BD', 'Bangladesh'],
  ['BO', 'Bolivia'],
  ['BY', 'Belarus'],
  ['BI', 'Burundi'],
  ['MM', 'Burma (Myanmar)'],
  ['CI', "Cote D'Ivoire (Ivory Coast)"],
  ['CU', 'Cuba'],
  ['CD', 'Democratic Republic of Congo'],
  ['EC', 'Ecuador'],
  ['IR', 'Iran'],
  ['IQ', 'Iraq'],
  ['LR', 'Liberia'],
  ['LY', 'Libya'],
  ['ML', 'Mali'],
  ['MA', 'Morocco'],
  ['NP', 'Nepal'],
  ['KP', 'North Korea'],
  ['SO', 'Somalia'],
  ['SD', 'Sudan'],
  ['SY', 'Syria'],
  ['VE', 'Venezuela'],
  ['YE', 'Yemen'],
  ['ZW', 'Zimbabwe'],
  ['US', 'United States'],
]

const SANCTIONED_COUNTRY_CODES = SANCTIONED_COUNTRIES.map(
  (country) => country[0]
)

export function useIpAddress() {
  const [ipAllowed, setIpAllowed] = useState(true);
  const [ipCountry, setIpCountry] = useState('')
  
  useEffect(() => {
    const checkIpLocation = async () => {
      const response = await fetch(`https://www.cloudflare.com/cdn-cgi/trace`);
      const parsedResponse = await response.text();
      const ipLocation = parsedResponse.match(/loc=(.+)/);
      const ipCountryCode = ipLocation ? ipLocation[1] : '';

      setIpCountry(ipCountryCode)
      /*
      if (ipCountryCode) {
        setIpAllowed(ipCountryCode !== 'US');
      }
      */
      if (ipCountryCode) {
        setIpAllowed(!SANCTIONED_COUNTRY_CODES.includes(ipCountryCode))
      }
    };

    checkIpLocation();
  }, []);

  return { ipAllowed };
}
