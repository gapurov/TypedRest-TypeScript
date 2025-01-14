import { Endpoint } from "./Endpoint";
import { HttpMethod, HttpClient, FetchHttpClient, HttpHeader } from "../http";
import { Serializer, JsonSerializer } from "../serializers";
import { ErrorHandler, DefaultErrorHandler } from "../errors";
import { LinkExtractor, AggregateLinkExtractor, HeaderLinkExtractor, HalLinkExtractor } from "../links";

/**
 * Represent the top-level URI of an API. Derive from this class and add your own set of child-{@link Endpoint}s as properties.
 */
export class EntryEndpoint extends Endpoint {
    /**
     * Creates a new entry endpoint.
     * @param uri The base URI of the REST API.<br>Missing trailing slash will be appended automatically.
     * @param serializer Controls the serialization of entities sent to and received from the server.<br>Defaults to {@link JsonSerializer} if undefined.
     * @param errorHandler Handles errors in HTTP responses.<br>Defaults to {@link DefaultErrorHandler} if undefined.
     * @param linkExtractor Detects links in HTTP responses.<br>Defaults to {@link HeaderLinkExtractor} and {@link HalLinkExtractor} combined via {@link AggregateLinkExtractor} if undefined.
     * @param httpClient The HTTP client used to communicate with the REST API.<br>Defaults to {@link FetchHttpClient} if undefined.
     */
    constructor(
        uri: URL | string,
        serializer?: Serializer,
        errorHandler?: ErrorHandler,
        linkExtractor?: LinkExtractor,
        httpClient?: HttpClient) {
        super(undefined,
            Endpoint.ensureTrailingSlash(uri),
            serializer ?? new JsonSerializer(),
            errorHandler ?? new DefaultErrorHandler(),
            linkExtractor ?? new AggregateLinkExtractor(new HeaderLinkExtractor(), new HalLinkExtractor()),
            httpClient ?? new FetchHttpClient());

        for (const mediaType of this.serializer.supportedMediaTypes) {
            this.httpClient.defaultHeaders.append(HttpHeader.Accept, mediaType);
        }
    }

    /**
     * Fetches meta data such as links from the server.
     * @param signal Used to cancel the request.
     * @throws {@link AuthenticationError}: {@link HttpStatusCode.Unauthorized}
     * @throws {@link AuthorizationError}: {@link HttpStatusCode.Forbidden}
     * @throws {@link NotFoundError}: {@link HttpStatusCode.NotFound} or {@link HttpStatusCode.Gone}
     * @throws {@link HttpError}: Other non-success status code
     */
    async readMeta(signal?: AbortSignal) {
        await this.send(HttpMethod.Get, signal);
    }
}
