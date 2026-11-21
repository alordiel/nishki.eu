import * as migration_20261121_162303_initial from './20261121_162303_initial';

export const migrations = [
  {
    up: migration_20261121_162303_initial.up,
    down: migration_20261121_162303_initial.down,
    name: '20261121_162303_initial'
  },
];
