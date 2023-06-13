# RestClient

## Instance

To create a new instance, you need to provide `IRequestOptionsGlobals` object as first parameter:

```typescript
const client = new RestClient({
	host: `https://server.com`,
	responseType: `text`
})
```

Any provided option will be considered the default for every subsequent request of the new instance.

Every option will be accessible/updatable using the public **options** property, an instance of [RestOptions](#RestOptions) class.

You can also override every options providing a `IRequestOptions` object as last parameter to the request method:

```typescript
const response = await client.get<any>(`/controller`, { responseType: `json` })
```

In the example above, the `responseType` option will be the override value just for that request, the global options will remain the same.

### IRequestOptionsGlobals

The following native properties from original [Fetch's Request Object](https://developer.mozilla.org/en-US/docs/Web/API/Request) are supported:

 * `abortController`
 * `credentials`
 * `mode`
 * `keepalive`
 * `headers`
 * `cache`
 * `redirect`
 * `referrer`
 * `referrerPolicy`

One of the library's goals is to extend the native capabilities, so here is a list of additional properties:

#### host

`string`

Defaults to `localhost.href`.

#### basePath

`string`

The base path to use on every request, defaults to `/`, combined with the `host` option.

## responseType

`HttpResponseFormat`

This property will lead the response body parsing, to get the proper output type. For example, with `json` as responseType you don't need to `JSON.parse()` on `response.data`.

It can be defined as:
1. `HttpResponseFormatType` typed value: `undefined` (default), `null`, `json`, `text`, `blob`, `arrayBuffer`, `formData`
2. A sync method returning a `HttpResponseFormatType`
   ```typescript
   (request: IRequest, fetchResponse: Response | null) = HttpResponseFormatType
   ```
3. An async method resolving a `HttpResponseFormatType`
   ```typescript
   (request: IRequest, fetchResponse: Response | null) = Promise<HttpResponseFormatType>
   ```

When the value resolved is `undefined` or `null`, the response's body will not be parsed.

## body

`Object` (es: `{ [key: string]: any }`) | `string` | `ArrayBuffer` | `ArrayBufferView` | `Blob` | `File` | `FormData` | `undefined`

Optional request body content, if the method is `GET`, this value will be set to `undefined`.

## query

``{ [key: string]: any }``

Optional key-value pair, this will be converted (and appended) to the request URI.

## queryParamsTransformer

`IQueryParamTransformer`

Let's suppose you have a complex key-value pair, in which every value needs to be converted using a custom logic.

You can do this using this as a callback having the following definition:

```typescript
interface IQueryParamTransformer {
	(key: string, value: any, query: any): string
}
```

...it needs to have back the `string` version of your custom type parameter.

Check out `tests/features.test.ts` to see it in action!

## queryParamsIncludeEmpty

`boolean`

If true, it will include falsy values as empty, example:

```
/example/?a=&b=
```

Defaults to false.

## cacheInMemory

`boolean`

If true, it will enable an internal, [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based, cache system.

Every entry for this cache, will use a compound-key containing the `cacheKey`, if provided.

See the [cache section](#built-in-cache-system) for more details.

Defaults to false.

## cacheKey

`string`

An optional alias reference to the current request, useful if you are using `cacheInMemory` parameter as true.

Defaults to empty string.

## throw

`boolean`

As standard behavior of fetch, every request will never throw error. But sometimes, in very large applications, you need a centralized API error handler.

If true, when the standard [fetch -> Response.ok](https://developer.mozilla.org/en-US/docs/Web/API/Response/ok) is false the API will throw an error.

The error object will be an instance of [RestError](#RestError) class.

Defaults to false.

## throwExcluding

`IResponseFilter[]`

Even when you throwing error on failed requests, sometimes you may need to filter this errors and react properly without throwing.

You can do this providing an array of `IResponseFilter`.

A filter can be defined as object:

```typescript
await client.get(`/example`, {
	throwExcluding: [{ // every prop here is optional
		path: "/example", // filter based on url path
		method: "GET",
		statusCode: 404,
		errorCode: "Timeout", // the internal error code
	}]
})
```

...or as sync/async method returning `true` to prevent the `throw`:

```typescript
await client.get(`/example`, {
	throwExcluding: [
		async (err) => {
			let willPreventError = true;
			// ...awaitable methods here...
			return willPreventError;
		}
	]
})
```

If a failed request match one of the objects provided, your rest client instance will not throw any error.

You will find the matched filter on [Response Object](#response-object).throwFilter property.

Setting throwExcluding will also set `throw` option to `true`.

## overrideStrategy

`"merge" | "assign"`

On every request method, you can override any option just providing it as parameter.

Internally, the library supports the following strategies to update the request options:

* *merge* (default), every simple primitive type (like strings, and numbers) will be overwritten, while Headers, Object-like and Array-like options will be merged.
* *assign*, every value will be overwritten using [Object.assign()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign).

Note that this option cannot be overridden on a request method, to do this you need to set it globally using the [RestOptions API](#RestOptions).

## onRequest

`(request: IRequest): void | Promise`

Global handler, running on your `RestClient`'s instance context, called at every request. You can edit the outgoing request options, just modify the `request` object provided as first argument.

If the return value is a `Promise`'s instance, the request will `await` for it before starting.

## onResponse

`(response: IResponse): void`

Global handler, running on your `RestClient`'s instance context, called at every successful response received.
Keep in mind that, if you set the `throw` option as true, or any of your `throwExcluding` filters doesn't match, this handler will never be called.

## onError

`(error: RestError, response: IResponse): void`

Global handler, running on your `RestClient`'s instance context, called every time an error was received by a request. This callback will not be invoked if it is filtered by `throwExcluding` option.

## request()

`<TResponse, TError>(method: HttpMethod, path?: string, requestOptions?: Partial<IRequestOptions>): Promise<IResponse<TResponse, TError>>`

*Parameters*:
* HttpMethod (`GET` | `DELETE` | `HEAD` | `OPTIONS` | `POST` | `PUT` | `PATCH` | `LINK`)
* path *(string)*, the request path relative to `host`+`basePath`
* requestOptions *(IRequestOptions | undefined)*, local request options that will override the global options provided via constructor.

*Returns* `Promise<IResponse<TResponse, TError>>`, where:
 * `TResponse` is the `response.data` type (typescript intellisense)
 * `TError` is the **optional** `response.error.data` type

```typescript
const client = new RestClient({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `text`
})
const response = await client.request<string>("GET", "/action");
```

Note that the `path` property will be combined with `host` and `basePath`:

```typescript
const response = await client.request<string>("GET", "/action");
console.log(response.request.url.href);
```

## HttpMethod shortcut methods

Every RestClient instance has all the http methods as a lower case named method as shortcut:

* *get`<T>`()*
* *post`<T>`()*
* *put`<T>`()*
* etc...

...having the following, simplified, parameters:

* path *(string)*
* requestOptions *(IRequestOptions | undefined)

Example:

```typescript
const response = await client.get<string>(`/action`);
```

Note: every shortcut method will internally call the `request()` method.

## optionsOverride() method

Having the following definition:

```typescript
optionsOverride(overrides?: Partial<IRestOptions>, base?: Partial<IRestOptions>)
```
...will provide a copy of the `IRequestOptions` updated using the `overrideStrategy` option.

The optional `base` parameter defaults to the current rest client options object.

## Response Object

### fetchResponse

`([Response](https://developer.mozilla.org/en-US/docs/Web/API/Response))`

### request

`([Request (sent) Object](#request-sent-object))`

### error

`([RestError](#resterror)`<TError>`)`

### status

`(exported enum => HTTPStatusCode)`

### headers

`([Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers))`

### data

`(TResponse | null)`


The response body, leaded by `IRequestOptions.responseType` (runtime type) and `TResponse` (IDE type checking).

Example:

```typescript
interface IMyObject {
	test: string
}
const client = new RestClient({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `json`
})
const response = await client.get<IMyObject>(`/action`);
```

The property `response.data` will infer the `IMyObject` interface.

## throwFilter

`IResponseFilter`

When a `IResponseFilter` matches the response, this property will expose it.

## repeat

`(): Promise<IResponse<TResponse, TError>>`

A useful shortcut to repeat the request sent, having the following interface:

```typescript
export interface IRepeat<TResponse, TError = any> {
	(method?: HttpMethod, requestOptions?: IRequestOptions): Promise<IResponse<TResponse, TError>>
}
export interface IRepeat<TResponse, TError = any> {
	(requestOptions?: IRequestOptions): Promise<IResponse<TResponse, TError>>
}
```

Every parameter is optional and you can override every option as usual.

*Usage*
```typescript
const first = await restClient.get<any>("/action");
const second = await first.repeat();
```

## request

The request object used to get the response, including options, url, method and body.

**url**

The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using `host`, `basePath` and the request `path`.

## method

`HttpMethod`

**body**

The optional body used, typically when HttpMethod is `PUT` or `POST`.

## Built-in in-memory Cache System

A [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) based cache, disabled by default and triggered by the `cacheInMemory` flag.

If, for any reason, you want to avoid the complexity of the standard [Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache), this is the right way to go.

The `IRequestOptions.cacheKey` is the default used to store response objects, it can be...

 * provided during the `RestClient` initialization
 * updated via `RestClient.options` property (`RestOptions` methods)
 * overridden on any local `request` method (or any equivalent http shortcut)

See [Advanced usage](#advanced-usage) to get an example.

This internal cache system will never infer the native [Request.cache](https://developer.mozilla.org/en-US/docs/Web/API/Request/cache) property's behavior.

Enabling it, if a cached response for a particular request exists, the library will avoid the fetch call to resolve the `Promise` immediately.

All cache-related methods are `protected` and used internally on every request method if enabled, but you can use it to give super-powers on your custom rest client.

Here is the full list:

## cacheKey

`(url: `URL`, method: `HttpMethod` | "*" = "*", customKey?: `string`)`

Evaluate the unique cache-key for a particular request, having the provided `url`, (optional) `method`, combining this couple with the `cacheKey` option.

Providing the third parameter `customKey`, the string evaluated will change accordingly.

This method is used internally to complete common cache's task operations like set, get and clear; see the next methods to understand better.

## cacheSet

`(response: `IResponse`, customKey?: `string`)`

Store the response object provided to the internal `RestClient` instance's cache.

## cacheGet<TResponse>

`(url: `URL`, method: `HttpMethod` | "*" = "*", customKey?: `string`)`

Retrieve the response object, if exists, from the internal `RestClient` instance's cache.

## cacheClearByKey

`(cacheKey: `string`)`

Clears every cache entry in a `RestClient` instance context, matching with the provided `cacheKey`.

## cacheClear

`(): void`

Clears every cache entry in a `RestClient` instance context.

### RestOptions

Every instance of RestClient will have a public property named **options**, this is just an instance of `RestOptions`.

You can access and modify the global options of your rest client instance using his methods.

To create a new instance, just pass an `IRequestOptionsGlobals` object (optional) as first parameter:

```typescript
import { RestOptions } from "scarlett"

const opts = new RestOptions({
	host: `https://server.com`,
	basePath: "/controller",
	responseType: `json`
})
```

Here is the full list of available instance's methods:

## current

`(): IRequestOptions`

Will return a copy of the current `IRequestOptions`.

## get

`option`

Will return a copy of the option's value.

## set

`option, newValue`

To directly update an option (your TypeScript's IDE plugin will warn you about type issues).

## unset

`(option)`

Will internally restore the default value.

## clone

`(): RestOptions`

Will return a new cloned instance of `RestOptions` .

## merge

`(options: `IRequestOptions`)`

Override with *options* using the `merge` strategy.

## assign

`(options: `IRequestOptions`)`

Override with *options* using the `assign` strategy.

## createRestClient

`(): RestClient`

Will return a new `RestClient` based on the current options.

## setFactory

`(factoryClass: `RestClient`)`

Supposing that you created a new Class that extends the default RestClient (see [Advanced usage](#advanced-usage)), you can override the default factory class with this method.

Example:

```typescript
class MyRest extends RestClient { ... }

const rest = new RestOptions().setFactory(MyRest).createRestClient()
console.log(rest instanceof MyRest) // >> true
```

Note: Keep in mind that custom classes having extra/custom parameters are **not supported**, the only way to make it work is a class having the same RestClient's constructor.

**Usage:**

```typescript
import { RestOptions } from "scarlett"

const builder = new RestOptions()
	.set("host", "https://example.com")
	.set("basePath", "/api")
	.set("responseType", "json")

const restClient = builder.createRestClient()
```

# RestError

This class extends the default JavaScript's Error, it requires a template on constructor to qualify a response body, usually provided by backend API's handled exceptions.

The `constructor`:
```typescript
constructor(message: string, statusCode?: HTTPStatusCode, code?: InternalErrorCode)
```

When a request's response has an error, you will find an instance of `RestError` as a property named **error** on `IResponse` object. If the `throw` flag is enabled, or the `throwExcluding` fails to filter an error, the library will internally `throw` it.

If you expect a model for your error, you can provide its interface as follows:

```typescript
const response = await restClient.get<any, IBackendError>("/status-code/412");
const data = response.data;         // << response.data property will be null because of the error
const error = response.error?.data; // << error.data property will infer IBackendError interface
```

You can event import it and create an instance to extend your business logic:

```typescript
import { RestError } from "scarlett";
const err = new RestError<IBackendError>("The Error Message");
```

## message

`string`

A human-friendly error message.

## statusCode

`HTTPStatusCode`

The standard http status code.

## code

`InternalErrorCode`

An internal error code:

```typescript
type InternalErrorCode = "Timeout" | "BodyParse" | "UrlParameter";
```

## Instance properties:

## isRestError

`boolean`

Always true, it's a simple utility prop that can be useful to distinguish the standard `Error` from the `RestError`.

## request

`IRequest`

## fetchResponse

`[Response](https://developer.mozilla.org/en-US/docs/Web/API/Response)`

## code

`InternalErrorCode`

## statusCode

`HTTPStatusCode`

## data

`TError`

The error object parsed from response body content.
