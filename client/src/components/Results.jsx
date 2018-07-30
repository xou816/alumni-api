import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';

const styles = theme => ({
  
});

@withStyles(styles)
export default class Results extends React.Component {


 	render() {
  		let {classes} = this.props;
      let results = [
        {name: 'Patrick', class_: 96},
        {name: 'Bob', class_: 89}
      ];
    	return (
        <React.Fragment>
        {results.map(({name, class_}) => (
    	    	<ExpansionPanel>
    			    <ExpansionPanelSummary>
                <div>
                <Typography variant="title" gutterBottom>
                  {name}
                </Typography>
                <Typography variant="subheading" gutterBottom>
                  Class of {class_}
                </Typography>
                </div>
    			    </ExpansionPanelSummary>
    			    <ExpansionPanelDetails>
                <Typography>
                  Some details
                </Typography>
    			    </ExpansionPanelDetails>
    			  </ExpansionPanel>
        ))}
        </React.Fragment>
    	);
  	}
}