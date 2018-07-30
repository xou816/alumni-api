import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Input from '@material-ui/core/Input';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Typography from '@material-ui/core/Typography';
import classnames from 'classnames';

const availableFields = [
  {raw: 'first_name', pretty: 'First name'},
  {raw: 'last_name', pretty: 'Last name'},
  {raw: 'class', pretty: 'Class'},
  {raw: 'company', pretty: 'Company'}
]

const styles = theme => ({
  panel: {
  	background: 'rgba(255, 255, 255, 0.1)',
    transition: theme.transitions.create(['all']),
    color: theme.palette.primary.contrastText
  },
  panelExpanded: {
    background: 'white',
    color: theme.palette.text.primary
  },
  panelInner: {
  	paddingLeft: 2 * theme.spacing.unit,
  	paddingRight: 2 * theme.spacing.unit,
    flexWrap: 'wrap'
  },
  open: {
  	paddingBottom: 4 * theme.spacing.unit,
  },
  chip: {
  	marginRight: theme.spacing.unit,
    fontSize: theme.typography.button.fontSize
  },
  inputField: {
    background: theme.palette.grey[300],
    borderRadius: 10*theme.shape.borderRadius,
    padding: `0 ${theme.spacing.unit}px`,
    transition: theme.transitions.create(['background']),
    marginBottom: theme.spacing.unit
  },
  inputFocused: {
    background: theme.palette.grey[400]
  }
});

@withStyles(styles)
export default class SearchField extends React.Component {

  state = {
    expanded: false,
    fields: []
  }

  onChange = event => {
    this.setState(({expanded}) => ({expanded: !expanded}));
  }

  onClickAway = event => {
    this.setState({expanded: false})
  }

  onKeyPress = ({raw, pretty}) => event => {
    if (event.key === 'Enter') {
      let value = event.target.value;
      this.setState(({fields}) => ({
        fields: fields.concat({name: raw, pretty, value})
      }))
    }
  }

  onDelete = name => event => {
    this.setState(({fields}) => ({
        fields: fields.filter(f => f.name !== name)
    }))
  }

  fieldsUsed = () => this.state.fields
    .map(({name}) => name)

  fieldsLeft = () => availableFields
    .filter(({raw}) => this.fieldsUsed().indexOf(raw) === -1)

  componentDidUpdate(prevProps, prevState) {
    if (prevState.fields.length !== this.state.fields.length) {
      this.props.onSearchChanged(this.state.fields);
    }
  }

 	render() {
  		let {classes} = this.props;
      let {expanded, fields} = this.state;
    	return (<ClickAwayListener onClickAway={this.onClickAway}>
	    	<ExpansionPanel classes={{root: classes.panel, expanded: classes.panelExpanded}} 
                        elevation={expanded ? 2 : 0}
                        expanded={expanded} 
                        onChange={this.onChange}>
			    <ExpansionPanelSummary classes={{root: classes.panelInner}}>
			      <div>
            {
              fields.length > 0 ?
              fields.map(({name, pretty, value}) => (
			          <Chip key={name} className={classes.chip} label={`${pretty}: ${value}`} onDelete={this.onDelete(name)} />
              )) :
              <Typography component="span" color="inherit">No criteria</Typography>
            }
            </div>
			    </ExpansionPanelSummary>
			    <ExpansionPanelDetails classes={{root: classes.panelInner}}>
            <div>
            {
              this.fieldsLeft().length > 0 ?
              this.fieldsLeft().map(({raw, pretty}) => (
                <Input disableUnderline 
                      classes={{root: classnames(classes.inputField, classes.chip), focused: classes.inputFocused}} 
                      key={raw} 
                      onKeyPress={this.onKeyPress({raw, pretty})} 
                      placeholder={pretty} />
              )) :
              <Typography component="span" color="inherit">No more criteria!</Typography>
            }
            </div>
			    </ExpansionPanelDetails>
			  </ExpansionPanel>
    	</ClickAwayListener>);
  	}
}