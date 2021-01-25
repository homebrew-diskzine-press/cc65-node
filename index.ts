
import { exec } from 'child_process';
import { promisify } from 'util';

const exec_p = promisify(exec);

export type TargetSystem = (
  'none'
  | 'apple2'
  | 'apple2enh'
  | 'atari'
  | 'atmos'
  | 'c16'
  | 'c64'
  | 'c128'
  | 'cbm510'
  | 'cbm610'
  | 'geos'
  | 'lunix'
  | 'lynx'
  | 'nes'
  | 'pet'
  | 'plus4'
  | 'supervision'
  | 'vic20'
);

export type LinkerTarget = (
  Exclude<TargetSystem, 'geos'>
  | 'module'
  | 'atari2600'
  | 'atarixl'
  | 'geos-apple'
  | 'geos-cbm'
  | 'sim6502'
  | 'sim65c02'
  | 'telestrat'
);

export type AssemblerFeature = (
  'at_in_identifiers'
  | 'c_comments'
  | 'dollar_in_identifiers'
  | 'dollar_is_pc'
  | 'labels_without_colons'
  | 'leading_dot_in_identifiers'
  | 'loose_char_term'
  | 'loose_string_term'
  | 'missing_char_term'
  | 'org_per_seg'
  | 'pc_assignment'
  | 'ubiquitous_idents'
);

export interface CompilerOptions {
  bssName?: string;
  checkStack?: boolean;
  codeName?: string;
  codesize?: number;
  cpu?: '6502' | '65C02';
  createDep?: boolean;
  dataName?: string;
  debug?: boolean;
  debugInfo?: boolean;
  define?: string[];
  forgetIncPaths?: boolean;
  help?: boolean;
  outputFile?: string;
  includeDirs?: string[];
  registerSpace?: number;
  registerVars?: boolean;
  rodataName?: string;
  signedChars?: boolean;
  standard?: 'c89' | 'c99' | 'cc65';
  staticLocals?: boolean;
  target?: TargetSystem;
  verbose?: boolean;
  version?: boolean;
  writableStrings?: boolean;
  addSource?: boolean;
  optimizer?: {enable:false} | {enable:true, settings?:Array<'i' | 'r' | 's'>};
}

export interface AssemblerOptions {
  cpu?: '6502' | '65SC02' | '65C02' | '65816' | 'sunplus' | 'sweet16' | 'HuC6280';
  features?: AssemblerFeature[];
  forgetIncPaths?: boolean;
  debugInfo?: boolean;
  ignoreCase?: boolean;
  listing?: boolean;
  listBytes?: number;
  macpackDir?: string;
  memoryModel?: 'near' | 'far' | 'huge';
  outputFile?: string;
  pagelength?: number;
  smartMode?: boolean;
  target?: TargetSystem;
  verbose?: boolean;
  define?: string[];
  includeDirs?: string[];
  autoImport?: boolean;
  version?: boolean;
  warningLevel?: number;
}

export interface LinkerOptions {
  allowMultipleDefinition?: boolean;
  startGroup?: boolean;
  endGroup?: boolean;
  help?: boolean;
  mapfile?: string;
  outputName?: string;
  target?: LinkerTarget;
  forceImport?: string[];
  verbose?: boolean;
  vm?: boolean;
  outputConfigFile?: string;
  define?: string[];
  libPaths?: string[];
  Ln?: boolean;
  startAddr?: number;
  version?: boolean;
  cfgPath?: string;
  dbgfile?: string;
  largeAlignment?: boolean;
  libs?: string[];
  objs?: string[];
  objPaths?: string[];
}

export interface ObjectToolOptions {
  bssLabel?: string;
  bssName?: string;
  codeLabel?: string;
  codeName?: string;
  dataLabel?: string;
  dataName?: string;
  debug?: boolean;
  debugInfo?: boolean;
  help?: boolean;
  o65Model?: 'lunix' | 'os/a65' | 'cc65-module';
  noOutput?: boolean;
  outputName?: string;
  verbose?: boolean;
  version?: boolean;
  zeropageLabel?: string;
  zeropageName?: string;
}

export function cc65(options: CompilerOptions, filename: string) {
  const { define = [], includeDirs = [], optimizer = {enable:false}, ...rest } = options;
  const parameters = [
    ...Object.entries(rest)
    .filter(([_, b]) => (b !== false && b !== null && b !== undefined))
    .map(([a, b]): [string] | [string, string] => {
      a = '--' + a.replace(/[A-Z]/g, v => '-' + v.toLowerCase());
      if (b === true) return [a];
      return [a, `${b}`];
    }),
    ...define.map(v => ['-D', v]),
    ...includeDirs.map(v => ['-I', v]),
    ...optimizer.enable ? [['-O' + (optimizer.settings || []).join('')]] : [],
    [filename],
  ];
  const cmd = 'cc65 ' + parameters.map(v => v.join(' ')).join(' ');
  return exec_p(cmd);
}

export function ca65(options: AssemblerOptions, filename: string) {
  const { define = [], includeDirs = [], features = [], ...rest } = options;
  const parameters = [
    ...Object.entries(rest)
    .filter(([_, b]) => (b !== false && b !== null && b !== undefined))
    .map(([a, b]): [string] | [string, string] => {
      a = '--' + a.replace(/[A-Z]/g, v => '-' + v.toLowerCase());
      if (b === true) return [a];
      return [a, `${b}`];
    }),
    ...define.map(v => ['-D', v]),
    ...includeDirs.map(v => ['-I', v]),
    ...features.map(f => ['--feature', f]),
    [filename],
  ];
  const cmd = 'ca65 ' + parameters.map(v => v.join(' ')).join(' ');
  return exec_p(cmd);
}

export function ld65(options: LinkerOptions, ...filenames: string[]) {
  const { define = [], forceImport = [], libPaths = [], libs = [], objs = [], objPaths = [], ...rest } = options;
  const parameters = [
    ...Object.entries(rest)
    .filter(([_, b]) => (b !== false && b !== null && b !== undefined))
    .map(([a, b]): [string] | [string, string] => {
      a = '--' + a.replace(/[A-Z]/g, v => '-' + v.toLowerCase());
      if (b === true) return [a];
      return [a, `${b}`];
    }),
    ...define.map(v => ['-D', v]),
    ...forceImport.map(v => ['--force-import', v]),
    ...libPaths.map(f => ['--lib-path', f]),
    ...libs.map(f => ['--lib', f]),
    ...objPaths.map(f => ['--obj-path', f]),
    ...objs.map(f => ['--obj', f]),
    ...filenames.map(v => [v]),
  ];
  const cmd = 'ld65 ' + parameters.map(v => v.join(' ')).join(' ');
  return exec_p(cmd);
}

export function co65(options: ObjectToolOptions, filename: string) {
  const parameters = [
    ...Object.entries(options)
    .filter(([_, b]) => (b !== false && b !== null && b !== undefined))
    .map(([a, b]): [string] | [string, string] => {
      a = '--' + a.replace(/[A-Z]/g, v => '-' + v.toLowerCase());
      if (b === true) return [a];
      return [a, `${b}`];
    }),
    [filename],
  ];
  const cmd = 'co65 ' + parameters.map(v => v.join(' ')).join(' ');
  return exec_p(cmd);
}
