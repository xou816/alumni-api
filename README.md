WIP!

Example usage:

```
mutation {
  addSource(source: "mock", credentials: {username: "user", password:"password"}) {
    name
    enabled
  }
}
```

Then:

```
{
  search(source: "all", class: "2019") {
    edges {
      node {
        id
        first_name
        last_name
        source
      }
    }
    cursor
  }
}
```