import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import CircularProgress from '@material-ui/core/CircularProgress';
import Slide from '@material-ui/core/Slide';
import ResultsTable from './ResultsTable';

const styles = theme => ({
  center: {
    textAlign: 'center'
  }
});

@withStyles(styles)
export default class Results extends React.Component {

 	render() {
  		let {classes, query} = this.props;
    	return (
        <QueryRenderer 
          environment={environment}
          query={graphql`
            query ResultsQuery($source: String, $first_name: String, $last_name: String, $class: String, $company: String) {
              search(source: $source, class: $class, company: $company, first_name: $first_name, last_name: $last_name) {
                edges {
                  node {
                    id
                    source
                    url
                    first_name
                    last_name
                    class
                  }
                }
              }
            }
            `}
          variables={query}
          render={({error, props}) => props && props.search ? 
            <Slide in direction="up"><ResultsTable edges={props.search.edges} /></Slide> : 
            <div className={classes.center}><CircularProgress /></div>}>
        </QueryRenderer>
    	);
  	}
}