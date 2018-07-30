import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import TextField from '@material-ui/core/TextField';

const styles = theme => ({
  panel: {
  	background: 'rgba(255, 255, 255, 0.1)',
    transition: 'all .3s ease'
  },
  panelExpanded: {
    background: 'white'
  },
  summary: {
  	paddingLeft: 2 * theme.spacing.unit,
  	paddingRight: 2 * theme.spacing.unit
  },
  open: {
  	paddingBottom: 4 * theme.spacing.unit,
  },
  chip: {
  	marginRight: theme.spacing.unit
  }
});

@withStyles(styles)
export default class SearchField extends React.Component {

  state = {
    expanded: true
  }

  onChange = (event, expanded) => {
    this.setState({expanded});
  }

 	render() {
  		let {classes} = this.props;
      let {expanded} = this.state;
    	return (
	    	<ExpansionPanel classes={{root: classes.panel, expanded: classes.panelExpanded}} 
                        elevation={expanded ? 2 : 0} 
                        onChange={this.onChange}>
			    <ExpansionPanelSummary classes={{root: classes.summary}}>
			      <div>
			        <Chip className={classes.chip} label="name:Patrick" onDelete={() => {}} />
	    			  <Chip className={classes.chip} label="class:2019" onDelete={() => {}} />
	    			</div>
			    </ExpansionPanelSummary>
			    <ExpansionPanelDetails>
			      <TextField label="Name" variant="outlined" />
			    </ExpansionPanelDetails>
			  </ExpansionPanel>
    	);
  	}
}