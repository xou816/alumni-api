import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  
});

@withStyles(styles)
export default class Results extends React.Component {

 	render() {
  		let {classes, query} = this.props;
      let results = [
        {name: 'Patrick', class_: 96},
        {name: 'Bob', class_: 89}
      ];
      console.log(query)
    	return (
        <QueryRenderer 
          environment={environment}
          query={graphql`
            query ResultsQuery($class: String) {
              search(class: $class, company: $company) {
                edges {
                  node {
                    first_name
                    last_name
                  }
                }
              }
            }
            `}
          variables={query}
          render={({error, props}) => props && props.search ? props.search.edges.map(edge => (
    	    	<ExpansionPanel>
    			    <ExpansionPanelSummary>
                <div>
                <Typography variant="title" gutterBottom>
                  {edge.node.first_name}
                </Typography>
                <Typography variant="subheading" gutterBottom>
                  Class of 99
                </Typography>
                </div>
    			    </ExpansionPanelSummary>
    			    <ExpansionPanelDetails>
                <Typography>
                  Some details
                </Typography>
    			    </ExpansionPanelDetails>
    			  </ExpansionPanel>
        )) : <CircularProgress />}>
        </QueryRenderer>
    	);
  	}
}