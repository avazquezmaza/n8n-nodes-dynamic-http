import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription } from 'n8n-workflow';
interface CredentialData {
    name?: string;
    value?: string;
    token?: string;
    [key: string]: unknown;
}
interface CachedCredential {
    credential: CredentialData;
    expiresAt: number;
}
interface CachedNameToId {
    id: string;
    expiresAt: number;
}
interface NodeOptions {
    timeout?: number;
    retry?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    enableLogging?: boolean;
    continueOnFail?: boolean;
}
export declare class DynamicHttpWithCredentials implements INodeType {
    description: INodeTypeDescription;
    protected static credentialCache: Map<string, CachedCredential>;
    protected static nameToIdCache: Map<string, CachedNameToId>;
    /**
     * Sanitizes log messages to mask sensitive credential information with asterisks
     * OPTIMIZED: Pre-compiled regex patterns for better performance
     */
    private static readonly CREDENTIAL_ID_REGEX;
    private static readonly BEARER_TOKEN_REGEX;
    private static readonly LONG_TOKEN_REGEX;
    private static readonly URL_PATTERNS;
    private static readonly API_KEY_REGEX;
    private static readonly SECRET_REGEX;
    private static readonly COMMON_WORDS_SET;
    private sanitizeLogMessage;
    /**
     * Logs a message if logging is enabled, sanitizing sensitive information
     */
    private log;
    /**
     * Sanitizes data objects to hide sensitive information
     */
    private sanitizeData;
    /**
     * Retrieves the credentialStore object from the executeFunctions context.
     * Based on TrkDynamicHttp implementation which works correctly.
     */
    protected static getCredentialStore(executeFunctions: IExecuteFunctions): unknown;
    /**
     * Helper function to find credential in an array
     */
    private static findCredentialInArray;
    /**
     * Fetches a credential from cache or from n8n's credential store.
     * OPTIMIZED: Removed unnecessary delays, improved error handling
     */
    protected getCachedCredential(executeFunctions: IExecuteFunctions, credentialId: string, credentialType: string, options: NodeOptions | undefined, itemIndex?: number): Promise<CredentialData | null>;
    /**
     * Clears expired entries from cache (optimized: only expired, not all)
     */
    protected static cleanExpiredCacheEntries(): void;
    /**
     * Checks if a string looks like an n8n credential ID
     * OPTIMIZED: Fast validation for credential IDs
     * n8n credential IDs are alphanumeric strings of 16-20 characters
     * Examples: AbCdEfGhIjKlMnOp (16), XyZaBcDeFgHiJkLm (16)
     */
    protected static isLikelyCredentialId(value: string): boolean;
    /**
     * Sets the node's credential ID temporarily
     */
    protected setNodeCredentialId(executeFunctions: IExecuteFunctions, credentialId: string, credentialType?: string): string | undefined;
    /**
     * Restores the original credential ID
     */
    protected restoreNodeCredentialId(executeFunctions: IExecuteFunctions, originalCredId: string | undefined, credentialType?: string): void;
    /**
     * Finds credential ID by name or ID
     * OPTIMIZED: Uses credentialMap first, then cache, then searches
     * Supports both credential name and credential ID
     */
    protected findCredentialIdByName(executeFunctions: IExecuteFunctions, credentialNameOrId: string, credentialType?: string, options?: NodeOptions): Promise<string | null>;
    /**
     * Calculates exponential backoff delay with jitter
     */
    private static calculateRetryDelay;
    /**
     * Gets parameter value, trying node parameter first, then item data
     */
    private static getParameterOrItemData;
    /**
     * Transforms response data to include company name as key
     * OPTIMIZED: Reduced allocations and early returns
     */
    private static transformResponseData;
    execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]>;
}
export {};
