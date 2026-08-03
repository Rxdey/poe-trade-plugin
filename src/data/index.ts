import { PluginRepository } from './repositories/plugin-repository';
import { GmStorageDriver } from './storage/gm-storage-driver';

export const pluginRepository = new PluginRepository(new GmStorageDriver());
