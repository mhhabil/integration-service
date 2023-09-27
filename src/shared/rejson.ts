import { map } from 'lodash';

export class ReJson {
  protected cmds = {};

  protected commands = [
    'JSON.DEL',
    'JSON.GET',
    'JSON.MGET',
    'JSON.SET',
    'JSON.TYPE',
    'JSON.NUMINCRBY',
    'JSON.NUMMULTBY',
    'JSON.STRAPPEND',
    'JSON.STRLEN',
    'JSON.ARRAPPEND',
    'JSON.ARRINDEX',
    'JSON.ARRINSERT',
    'JSON.ARRLEN',
    'JSON.ARRPOP',
    'JSON.ARRTRIM',
    'JSON.OBJKEYS',
    'JSON.OBJLEN',
    'JSON.DEBUG',
    'JSON.FORGET',
    'JSON.RESP',
  ];

  constructor(public client) {
    // Add new commands
    for (const i in this.commands) {
      const command = this.commands[i];
      const cmd = client.createBuiltinCommand(command);
      this.cmds[command] = cmd.string;
      this.cmds[command + 'Buffer'] = cmd.buffer;
    }
  }

  resolveKey(key) {
    return `${this.client.options.keyPrefix}${key}`;
  }

  set = (key, path, value) => {
    const _value = JSON.stringify(value);
    const cmd = this.cmds['JSON.SET'];
    return cmd
      .call(this.client, this.resolveKey(key), path, _value)
      .then((result) => {
        if (result === 'OK') {
          return true;
        }
        throw new Error(result);
      });
  };

  get = (key, path) => {
    const cmd = this.cmds['JSON.GET'];
    return cmd
      .call(this.client, this.resolveKey(key), path)
      .then((value) => JSON.parse(value));
  };

  mget = () => {
    const cmd = this.cmds['JSON.MGET'];
    const _arguments = Array.prototype.slice.call(ReJson.arguments);
    return cmd.apply(this.client, _arguments).then(function (results) {
      return map(results, function (value) {
        return JSON.parse(value);
      });
    });
  };

  del = (key, path) => {
    const cmd = this.cmds['JSON.DEL'];
    return cmd.call(this.client, key, path).then(function (result) {
      return result === 1;
    });
  };

  objkeys = (key, path) => {
    const cmd = this.cmds['JSON.OBJKEYS'];
    return cmd.call(this.client, key, path);
  };

  objlen = (key, path) => {
    const cmd = this.cmds['JSON.OBJLEN'];
    return cmd.call(this.client, key, path);
  };

  type = (key, path) => {
    const cmd = this.cmds['JSON.TYPE'];
    return cmd.call(this.client, key, path);
  };

  numincrby = (key, path, number) => {
    const cmd = this.cmds['JSON.NUMINCRBY'];
    return cmd.call(this.client, key, path, number).then(function (result) {
      return parseFloat(result);
    });
  };

  nummultby = (key, path, number) => {
    const cmd = this.cmds['JSON.NUMMULTBY'];
    return cmd.call(this.client, key, path, number).then(function (result) {
      return parseFloat(result);
    });
  };

  strappend = (key, path, string) => {
    const cmd = this.cmds['JSON.STRAPPEND'];
    return cmd.call(this.client, key, path, JSON.stringify(string));
  };

  strlen = (key, path) => {
    const cmd = this.cmds['JSON.STRLEN'];
    return cmd.call(this.client, key, path);
  };

  arrappend = () => {
    const cmd = this.cmds['JSON.ARRAPPEND'];
    const _arguments = Array.prototype.slice.call(ReJson.arguments);
    const fixed = _arguments.slice(0, 2);
    const items = map(_arguments.slice(2), function (item) {
      return JSON.stringify(item);
    });
    return cmd.apply(this.client, fixed.concat(items));
  };

  arrindex = (key, path, scalar) => {
    const cmd = this.cmds['JSON.ARRINDEX'];
    return cmd.call(this.client, key, path, JSON.stringify(scalar));
  };

  arrinsert = () => {
    const cmd = this.cmds['JSON.ARRINSERT'];
    const _arguments = Array.prototype.slice.call(ReJson.arguments);
    const fixed = _arguments.slice(0, 3);
    const items = map(_arguments.slice(3), function (item) {
      return JSON.stringify(item);
    });
    return cmd.apply(this.client, fixed.concat(items));
  };

  arrlen = (key, path) => {
    const cmd = this.cmds['JSON.ARRLEN'];
    return cmd.call(this.client, key, path);
  };

  arrpop = (key, path, index) => {
    const cmd = this.cmds['JSON.ARRPOP'];
    return cmd.call(this.client, key, path, index).then(function (result) {
      return JSON.parse(result);
    });
  };

  arrtrim = (key, path, start, end) => {
    const cmd = this.cmds['JSON.ARRTRIM'];
    return cmd.call(this.client, key, path, start, end);
  };
}
