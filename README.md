WIP!

Example usage:

```
curl -u toto:password -H "Content-Type: application/json" -X POST -d '{"username":"USER","password":"PASS"}' http://localhost:3000/auth/alumnis
```

Then, with GraphQL:

```
{
  search(class: "2019") {
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