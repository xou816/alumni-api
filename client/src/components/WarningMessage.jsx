import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import amber from '@material-ui/core/colors/amber';
import Paper from '@material-ui/core/Paper';
import Icon from '@material-ui/icons/Warning';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
  warning: {
    background: amber[700],
    display: 'flex',
    color: theme.palette.primary.contrastText,
    padding: theme.spacing.unit * 2,
    margin: `${theme.spacing.unit * 3}px 0`,
  },
  warningText: {
    flexGrow: 1,
    color: 'inherit',
    marginLeft: theme.spacing.unit
  }
});

const WarningMessage = ({children, classes}) => {
  return (
  	<Paper className={classes.warning}>
      <Icon />
      <Typography variant="body1" className={classes.warningText}>
        {children}
      </Typography>
    </Paper>
  )
}

export default withStyles(styles)(WarningMessage);