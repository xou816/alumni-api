import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Icon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListSubheader from '@material-ui/core/ListSubheader';
import { QueryRenderer, graphql } from 'react-relay';
import environment from '../environment';
import { Link } from 'react-router-dom'

@withStyles(theme => ({
  panel: {
    ...theme.mixins.gutters(),
    padding: 2*theme.spacing.unit,
    marginBottom: 2*theme.spacing.unit,
  },
  panelNoSpacing: {
    marginBottom: 2*theme.spacing.unit,
  },
  buttonContainer: {
    textAlign: 'center',
    position: 'relative',
    top: theme.spacing.unit * -4,
    marginBottom: theme.spacing.unit * -4,
  },
}))
class Profile extends React.Component {

  render() {
    let {alumni, classes} = this.props;
    return (
      <React.Fragment>
        <Button color="secondary" component={Link} to="/">Back to results</Button>
        <Slide in direction="up">
          <div>
            <Paper className={classes.panel}>
              <Typography variant="title" color="inherit">{alumni.first_name} {alumni.last_name}</Typography>
              <Typography variant="subheading" color="inherit">{alumni.school}, class of {(alumni.class || '??').toString().substring(2)}'</Typography>
            </Paper>
            {alumni.company.length === 0 ? null : <Paper className={classes.panelNoSpacing}>
              <List dense subheader={<ListSubheader>Employment</ListSubheader>}>
              {
                alumni.company.map(company => <ListItem key={company}><ListItemText>{company}</ListItemText></ListItem>)
              }
              </List>
            </Paper>}
            {alumni.phone.length === 0 ? null : <Paper className={classes.panelNoSpacing}>
              <List dense subheader={<ListSubheader>Phone</ListSubheader>}>
              {
                alumni.phone.map(phone => <ListItem key={phone}><ListItemText>{phone}</ListItemText></ListItem>)
              }
              </List>
            </Paper>}
            {alumni.email.length === 0 ? null : <Paper className={classes.panelNoSpacing}>
              <List dense subheader={<ListSubheader>Email</ListSubheader>}>
              {
                alumni.email.map(email => <ListItem key={email}><ListItemText>{email}</ListItemText></ListItem>)
              }
              </List>
            </Paper>}
          </div>
        </Slide>
      </React.Fragment>
    )
  }
}


@withStyles(theme => ({
  center: {
    textAlign: 'center'
  }
}))
export default class extends React.Component {

  render() {
    let {id, classes} = this.props;
    return (
      <QueryRenderer 
        environment={environment}
        query={graphql`
          query ProfileQuery($id: ID!) {
            alumni: node(id: $id) {
              id
              ... on Alumni {
                first_name
                last_name
                url
                class 
                company
                school
                email
                phone
              }
            }
          }
        `}
        variables={{id}}
        render={({error, props}) => (
          props && props.alumni ? 
            <Profile alumni={props.alumni} /> : 
            <div className={classes.center}><CircularProgress /></div>
         )} />
    );
  }

}