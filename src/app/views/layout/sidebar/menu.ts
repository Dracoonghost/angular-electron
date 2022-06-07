export const MENU = [
  // {
  //   label: 'Main',
  //   isTitle: true
  // },
  {
    label: 'Dashboard',
    icon: 'dashboard.svg',
    link: '/dashboard/home',
    submenu: [],
    tooltip: 'A quick-view of all activity'
  },
  {
    label: 'Clients',
    icon: 'SSID.svg',
    link: '/ssid/list',
    aclName: 'TOF Services',
    acls: ['ssid'],
    submenu: [],
    tooltip: 'View and manage your clients',
    aclRequired: true
  },
  {
    link: '/request',
    label: 'Requests',
    icon: 'request.svg',
    class: '',
    aclRequired: true,
    aclName: 'requests',
    tooltip: 'Vote on and review any transaction orders',
    acls: ['requests'],
    submenu: []
  },
  {
    label: 'NFT',
    icon: 'nft.svg',
    link: '/nft/nfts',
    aclName: 'TOF Services',
    acls: ['nft'],
    aclRequired: true,
    tooltip: 'Non-Fungible Token creation & management',
    submenu: [
      // {
      //   label: 'NFT List',
      //   link: '/nft/list',
      //   icon: '',
      //   class: '',
      //   extralink: false,
      //   aclName: 'nft',
      //   submenu: [],
      //   tooltip: 'View secured & created NFTs'
      // },
      // {
      //   label: 'OpenSea NFT',
      //   link: '/import-nft',
      //   icon: '',
      //   class: '',
      //   extralink: false,
      //   aclName: 'nft',
      //   submenu: [],
      //   tooltip: 'Check existing wallets, import and secure external NFTs'
      // },
      {
        label: 'NFT List',
        link: '/create-nft/listNFT',
        icon: '',
        class: '',
        extralink: false,
        aclName: 'nft',
        submenu: [],
        tooltip: 'View secured & created NFTs '
      },
      {
        label: 'Import NFT',
        link: '/import-nft',
        aclName: 'nft',
        tooltip: 'Check existing wallets, import and secure external NFTs'
      },
      // {
      //   label: 'Create NFT',
      //   link: '/nft/create',
      //   icon: '',
      //   class: '',
      //   extralink: false,
      //   aclName: 'nft',
      //   submenu: [],
      //   tooltip: 'Mint single NFTs for your clients'
      // },
      {
        label: 'Create NFT',
        link: 'create-nft',
        icon: '',
        class: '',
        extralink: false,
        aclName: 'nft',
        submenu: [],
        tooltip: 'Mint single NFTs for your clients'
      },
      // {
      //   label: 'Bulk NFT',
      //   link: '/nft/bulk/list',
      //   aclName: 'nft',
      //   tooltip: 'Mint multiple NFTs at one time'
      // },
      // {
      //   label: 'Bulk NFT',
      //   link: '/bulk-nft/list-bulk-nft',
      //   aclName: 'nft',
      //   tooltip: 'Mint multiple NFTs at one time'
      // }
    ]
  },
  // {
  //   label: 'Create NFT',
  //   icon: 'nft.svg',
  //   link: '/nft/create',
  //   aclName: 'TOF Services',
  //   acls: [''],
  //   submenu: [],
  //   aclRequired: false
  // },
  // {
  //   label: 'History',
  //   icon: 'history.svg',
  //   link: '/multiCryptoWallet/CMCW',
  //   aclName: 'TOF Services',
  //   acls: [''],
  //   submenu: [],
  //   aclRequired: false,
  //   tooltip: 'Here you can view your history'
  // },
  // {
  //   label: 'Certificate',
  //   icon: 'certificate.svg',
  //   link: '/multiCryptoWallet/CMCW',
  //   aclName: 'TOF Services',
  //   acls: [''],
  //   submenu: [],
  //   aclRequired: false,
  //   tooltip: 'Here you can view your certificate'
  // },
  // {
  //   label: 'Invoice',
  //   icon: 'invoice.svg',
  //   link: '/nft/invoiceList',
  //   aclName: 'TOF Services',
  //   acls: [''],
  //   submenu: [],
  //   aclRequired: false,
  //   tooltip: 'Here you can view your invoices'
  // },
  // {
  //   label: 'Import',
  //   icon: 'Import Icon.svg',
  //   link: '',
  //   aclName: 'TOF Services',
  //   acls: [''],
  //   submenu: [],
  //   aclRequired: false,
  //   tooltip: 'Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum Lorem Ipsum '
  // },
  {
    label: 'AI Check',
    icon: 'AICheck.svg',
    link: './no-ai-check',
    aclName: 'TOF Services',
    acls: ['aiCheck'],
    submenu: [],
    aclRequired: true,
    tooltip: 'Search by image, the worlds\' largest on-chain database for IP authentication'
  },
  {
    link: '/staff',
    label: 'Staff',
    icon: 'staff.svg',
    class: '',
    aclRequired: true,
    aclName: 'TOF Services',
    tooltip: 'Invite and authorize activities for your colleagues',
    acls: ['staff'],
    submenu: []
  },
  {
    label: 'Payment',
    icon: 'paymentIcon.png',
    link: '/payments/dashboard',
    aclName: 'TOF Services',
    acls: ['paymentDashboard'],
    submenu: [],
    tooltip: 'View the gas fees and charges of all transactions',
    aclRequired: true
  }
];

