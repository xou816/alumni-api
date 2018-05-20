import React from 'react';
import {graphql, QueryRenderer} from 'react-relay';
import environment from './environment';

export default class App extends React.Component {
  render() {
    return (
      <QueryRenderer
        environment={environment}
        query={graphql`
          query AppQuery {
            search {
              edges {
                node {
                  id
                }
              }
            }  
          }
        `}
        variables={{}}
        render={({error, props}) => {
          if (error) {
            return <div>Error!</div>;
          }
          if (!props) {
            return <div>Loading...</div>;
          }
          return <ul>{props.search.edges.map(edge => <li>{edge.node.id}</li>)}</ul>;
        }}
      />
    );
  }
}