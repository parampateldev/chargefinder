import { EVModel } from '@/types';

export const EV_MODELS: EVModel[] = [
  {
    id: 'tesla-model-3',
    name: 'Model 3',
    manufacturer: 'Tesla',
    batteryCapacity: 75,
    chargingCapabilities: [
      { connectorType: 'Tesla_Supercharger', maxPower: 250, chargingSpeed: 'ultra-rapid' },
      { connectorType: 'CCS1', maxPower: 150, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['Tesla_Supercharger', 'CCS1', 'Type2']
  },
  {
    id: 'tesla-model-y',
    name: 'Model Y',
    manufacturer: 'Tesla',
    batteryCapacity: 75,
    chargingCapabilities: [
      { connectorType: 'Tesla_Supercharger', maxPower: 250, chargingSpeed: 'ultra-rapid' },
      { connectorType: 'CCS1', maxPower: 150, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['Tesla_Supercharger', 'CCS1', 'Type2']
  },
  {
    id: 'tesla-model-s',
    name: 'Model S',
    manufacturer: 'Tesla',
    batteryCapacity: 100,
    chargingCapabilities: [
      { connectorType: 'Tesla_Supercharger', maxPower: 250, chargingSpeed: 'ultra-rapid' },
      { connectorType: 'CCS1', maxPower: 150, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['Tesla_Supercharger', 'CCS1', 'Type2']
  },
  {
    id: 'tesla-model-x',
    name: 'Model X',
    manufacturer: 'Tesla',
    batteryCapacity: 100,
    chargingCapabilities: [
      { connectorType: 'Tesla_Supercharger', maxPower: 250, chargingSpeed: 'ultra-rapid' },
      { connectorType: 'CCS1', maxPower: 150, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['Tesla_Supercharger', 'CCS1', 'Type2']
  },
  {
    id: 'chevrolet-bolt',
    name: 'Bolt EV',
    manufacturer: 'Chevrolet',
    batteryCapacity: 65,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 55, chargingSpeed: 'fast' },
      { connectorType: 'Type1', maxPower: 7.2, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type1']
  },
  {
    id: 'ford-mustang-mach-e',
    name: 'Mustang Mach-E',
    manufacturer: 'Ford',
    batteryCapacity: 88,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 150, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type2']
  },
  {
    id: 'bmw-i3',
    name: 'i3',
    manufacturer: 'BMW',
    batteryCapacity: 42,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 50, chargingSpeed: 'fast' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type2']
  },
  {
    id: 'audi-e-tron',
    name: 'e-tron',
    manufacturer: 'Audi',
    batteryCapacity: 95,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 150, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type2']
  },
  {
    id: 'nissan-leaf',
    name: 'Leaf',
    manufacturer: 'Nissan',
    batteryCapacity: 40,
    chargingCapabilities: [
      { connectorType: 'CHAdeMO', maxPower: 50, chargingSpeed: 'fast' },
      { connectorType: 'Type1', maxPower: 6.6, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CHAdeMO', 'Type1']
  },
  {
    id: 'hyundai-kona-electric',
    name: 'Kona Electric',
    manufacturer: 'Hyundai',
    batteryCapacity: 64,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 77, chargingSpeed: 'fast' },
      { connectorType: 'Type2', maxPower: 7.2, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type2']
  },
  {
    id: 'kia-soul-ev',
    name: 'Soul EV',
    manufacturer: 'Kia',
    batteryCapacity: 64,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 77, chargingSpeed: 'fast' },
      { connectorType: 'Type2', maxPower: 7.2, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type2']
  },
  {
    id: 'volkswagen-id4',
    name: 'ID.4',
    manufacturer: 'Volkswagen',
    batteryCapacity: 82,
    chargingCapabilities: [
      { connectorType: 'CCS1', maxPower: 125, chargingSpeed: 'rapid' },
      { connectorType: 'Type2', maxPower: 11, chargingSpeed: 'slow' }
    ],
    connectorTypes: ['CCS1', 'Type2']
  }
];