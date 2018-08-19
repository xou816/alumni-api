import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { createPaginationContainer, QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Slide from '@material-ui/core/Slide';
import ResultsTable from './ResultsTable';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  center: {
    textAlign: 'center'
  }
});

class Results extends React.Component {

  state = {
    loading: false
  }

 	render() {
    let {search, classes, relay} = this.props;
    let {loading} = this.state;
    return search && search.search ? (
        <Slide in direction="up">
          <React.Fragment>
            <ResultsTable results={search.search.edges} />
            {relay.hasMore() ? <Button disabled={loading} onClick={this.loadMore} color="secondary">Load more</Button> : null}
          </React.Fragment>
        </Slide>
      ) : null;
  }

  loadMore = () => {
    let {relay} = this.props;
    if (relay.hasMore() && !relay.isLoading()) {
      this.setState({ loading: true });
      relay.loadMore(20, err => this.setState({ loading: false }));
    }
  }

}

const ResultsPaginated = createPaginationContainer(Results, {
  search: graphql`
    fragment Results_search on Query @argumentDefinitions(
      count: {type: "Int", defaultValue: 20}
      cursor: {type: "String"}
      source: {type: "String", defaultValue: "all"}
      class: {type: "String"}
      first_name: {type: "String"}
      last_name: {type: "String"}
      company: {type: "String"}) {
      search(first: $count, after: $cursor, source: $source, class: $class, first_name: $first_name, last_name: $last_name, company: $company) @connection(key: "Results_search") {
        edges {
          node {
            id
            first_name
            last_name
            class
            url
          }
        }
      }
    }`
  },
  {
    direction: 'forward',
    getConnectionFromProps: props => props.search && props.search.search,
    getVariables: (props, {count, cursor}, fragmentVariables) => ({
      ...fragmentVariables, count, cursor
    }),
    query: graphql`
      query ResultsLoadMoreQuery($count: Int, $cursor: String, $source: String, $class: String, $first_name: String, $last_name: String, $company: String) {
        ...Results_search @arguments(count: $count, cursor: $cursor, source: $source, class: $class, first_name: $first_name, last_name: $last_name, company: $company)
      }
    `
  }
);

@withStyles(styles)
export default class extends React.Component {

  render() {
    let {query, classes} = this.props;
    return (
        <QueryRenderer 
          environment={environment}
          query={graphql`
            query ResultsQuery($count: Int, $cursor: String, $source: String, $class: String, $first_name: String, $last_name: String, $company: String) {
              ...Results_search @arguments(count: $count, cursor: $cursor, source: $source, class: $class, first_name: $first_name, last_name: $last_name, company: $company)
            }
          `}
          variables={{...query, count: 20}}
          render={({error, props}) => (
              <div className={classes.center}>
                {props ? <ResultsPaginated search={props} /> : <CircularProgress />}
              </div>
           )} />
      );
  }

}