
# Response Object

Once that rest client was defined, you can proceed to execute your REST calls, the response object obtained aims to cover every details needed by a complex application.

The return type of every REST method is basically a `Promise`, wrapping `IResponse<TResponse, TError>`, where:
 * `TResponse`, will infer the `response.data` type
 * `TError` (optional), will infer the `response.error.data` type

To start the inference just use Typescript Generics on the REST method:
```ts
const response = await client.get<MyObject, MyError>("/path")
```
...then you will have type inference on the following scenarios:
 * `response.data` typed as `MyObject` on success, or `undefined` on failure
 * `response.error.data` typed as `MyError` on failure, or `undefined` on success

Keep reading to better understand every prop provided by the `response` object.

## fetchResponse

Instance of type [Response](https://developer.mozilla.org/en-US/docs/Web/API/Response), the native response object from the Fetch API.

## request

```ts
interface IRequest {
	options: Partial<Options>;
	url: URL
	method: HttpMethod
	body?: any
}
```

The request object used to perform the request, containing:
* The `Options` object used
* The [URL](https://developer.mozilla.org/en-US/docs/Web/API/URL/URL) instance evaluated using host, basePath and the request path.
* The HTTP method used to perform the request.
* The (optional) request body, typically used when `HttpMethod` is PUT or POST.

## error

An instance of type [RestError](/api/rest-error) if present, or `undefined` on successful requests.

::: info
Keep in mind that this is considering the [throwExcluding](/api/request-options.html#throwexcluding) logics.
:::

## status

```ts
type StatusCode = number
```

The HTTP Status code of the response.

## headers

An instance of type [Headers](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Headers) class, representing the response headers of the request.

## data

The parsed response if present.

## throwFilter

When a provided throw filter (via [throwExcluding](/api/request-options#throwexcluding)) matches, this property will expose it.

## repeat

```ts
() => Promise<IResponse>
```

A shortcut to repeat the request sent with the same options.

```ts
const first = await get<any>("/action");
const second = await first.repeat();
```

You can even override request options on a local repeat call.

```ts
const response = await second.repeat({ responseType: "text" });
```
