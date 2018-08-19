import {
  Environment,
  Network,
  RecordSource,
  Store,
  QueryResponseCache
} from 'relay-runtime';

const cache = new QueryResponseCache({ size: 250, ttl: 60 * 5 * 1000 });

function fetchQuery(
  operation,
  variables,
) {
  let queryID = operation.name;
  let cachedData = cache.get(queryID, variables);
  return cachedData !== null ? cachedData : fetch('/api', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Basic dXNlcjpwYXNzd29yZA=='
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  })
  .then(response => response.json())
  .then(data => {
    if (operation.operationKind !== 'mutation') {
      cache.set(queryID, variables, data);
    }
    return data;
  })
}

const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),  
});

export default environment;