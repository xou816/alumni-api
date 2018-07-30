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
import Slide from '@material-ui/core/Slide';

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
            query ResultsQuery($first_name: String, $last_name: String, $class: String, $company: String) {
              search(source: "mock", class: $class, company: $company, first_name: $first_name, last_name: $last_name) {
                edges {
                  node {
                    id
                    source
                    first_name
                    last_name
                    class
                  }
                }
              }
            }
            `}
          variables={query}
          render={({error, props}) => props && props.search ? props.search.edges.map(edge => (
            <Slide direction="up" in>
    	    	<ExpansionPanel>
    			    <ExpansionPanelSummary>
                <div>
                <Typography variant="title" gutterBottom>
                  {edge.node.first_name} {edge.node.last_name}
                </Typography>
                <Typography variant="subheading" gutterBottom>
                  Class of {edge.node['class']}
                </Typography>
                </div>
    			    </ExpansionPanelSummary>
    			    <ExpansionPanelDetails>
                <Typography>
                  Reference: {edge.node.id}@{edge.node.source}
                </Typography>
    			    </ExpansionPanelDetails>
    			  </ExpansionPanel>
            </Slide>
        )) : <div className={classes.center}><CircularProgress /></div>}>
        </QueryRenderer>
    	);
  	}
}