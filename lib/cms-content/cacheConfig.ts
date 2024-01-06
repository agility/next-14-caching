export const cacheConfig = {
	defaultCacheDuration: process.env.AGILITY_CACHE_DURATION ? parseInt(process.env.AGILITY_CACHE_DURATION) : 60, //the default cache duration in seconds for agility content
};