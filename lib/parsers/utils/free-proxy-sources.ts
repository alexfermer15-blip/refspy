import { ProxySource } from '@/lib/types/parser.types';

export const FREE_PROXY_SOURCES: ProxySource[] = [
  {
    name: 'ProxyScrape HTTP',
    url: 'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
    format: 'text',
    type: 'http',
  },
  {
    name: 'ProxyScrape SOCKS4',
    url: 'https://api.proxyscrape.com/v2/?request=get&protocol=socks4&timeout=10000&country=all',
    format: 'text',
    type: 'socks4',
  },
  {
    name: 'ProxyScrape SOCKS5',
    url: 'https://api.proxyscrape.com/v2/?request=get&protocol=socks5&timeout=10000&country=all',
    format: 'text',
    type: 'socks5',
  },
  {
    name: 'TheSpeedX HTTP',
    url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
    format: 'text',
    type: 'http',
  },
  {
    name: 'TheSpeedX SOCKS4',
    url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks4.txt',
    format: 'text',
    type: 'socks4',
  },
  {
    name: 'TheSpeedX SOCKS5',
    url: 'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/socks5.txt',
    format: 'text',
    type: 'socks5',
  },
  {
    name: 'Proxy-List Daily',
    url: 'https://raw.githubusercontent.com/clarketm/proxy-list/master/proxy-list-raw.txt',
    format: 'text',
    type: 'http',
  },
  {
    name: 'OpenProxyList',
    url: 'https://raw.githubusercontent.com/roosterkid/openproxylist/main/HTTPS_RAW.txt',
    format: 'text',
    type: 'https',
  },
];
