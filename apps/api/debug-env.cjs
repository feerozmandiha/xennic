const { Module } = require('@nestjs/common');
const { ApiModule } = require('./dist/api.module.js');

console.log('ApiModule type:', typeof ApiModule);
console.log('ApiModule name:', ApiModule?.name);

const GenModule = Module({ imports: [ApiModule] })(class GenModule {});
console.log('GenModule type:', typeof GenModule);
console.log('GenModule name:', typeof GenModule === 'function' ? GenModule.name : 'N/A');

// Check metadata
const metadata = Reflect.getMetadata('modules', GenModule);
console.log('Metadata imports:', metadata?.imports?.length);
console.log('First import is ApiModule:', metadata?.imports?.[0] === ApiModule);
