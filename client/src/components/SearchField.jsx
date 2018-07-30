import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import TextField from '@material-ui/core/TextField';

const availableFields = [
  {raw: 'first_name', pretty: 'First name'},
  {raw: 'last_name', pretty: 'Last name'},
  {raw: 'class', pretty: 'Class'},
  {raw: 'company', pretty: 'Company'}
]

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
    expanded: true,
    fields: []
  }

  onChange = (event, expanded) => {
    this.setState({expanded});
  }

  onKeyPress = name => event => {
    if (event.key === 'Enter') {
      let value = event.target.value;
      let newFields = this.state.fields.concat({name, value});
      this.setState({
        fields: newFields
      })
      this.props.onSearchChanged(newFields)
    }
  }

  fieldsUsed = () => this.state.fields
    .map(({name}) => name)

  fieldsLeft = () => availableFields
    .filter(({raw}) => this.fieldsUsed().indexOf(raw) === -1)

 	render() {
  		let {classes} = this.props;
      let {expanded, fields} = this.state;
    	return (
	    	<ExpansionPanel classes={{root: classes.panel, expanded: classes.panelExpanded}} 
                        elevation={expanded ? 2 : 0} 
                        onChange={this.onChange}>
			    <ExpansionPanelSummary classes={{root: classes.summary}}>
			      <div>{
              fields.map(({name, value}) => (
			          <Chip key={name} className={classes.chip} label={`${name}:${value}`} onDelete={() => {}} />
              ))
            }</div>
			    </ExpansionPanelSummary>
			    <ExpansionPanelDetails>
          {this.fieldsLeft().map(({raw, pretty}) => (
            <TextField key={raw} onKeyPress={this.onKeyPress(raw)} label={pretty} variant="outlined" margin="normal" />
            ))
          }
			    </ExpansionPanelDetails>
			  </ExpansionPanel>
    	);
  	}
}