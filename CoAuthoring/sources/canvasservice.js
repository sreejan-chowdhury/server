﻿var sqlBase = require('./baseConnector');var docsCoServer = require('./DocsCoServer');var taskResult = require('./taskresult');var logger = require('./../../Common/sources/logger');var utils = require('./../../Common/sources/utils');var constants = require('./../../Common/sources/constants');var commonDefines = require('./../../Common/sources/commondefines');var storage = require('./../../Common/sources/storage-base');var formatChecker = require('./../../Common/sources/formatchecker');var statsDClient = require('./../../Common/sources/statsdclient');var licenseReader = require('./licensereader');var config = require('config');var config_server = config.get('services.CoAuthoring.server');var config_utils = config.get('services.CoAuthoring.utils');var cfgAutoSaveEnable = config_server.get('editor_settings_autosave_enable');var cfgAutoSaveMinInterval = config_server.get('editor_settings_autosave_mininterval');var cfgCoauthoringUrl = config_server.get('editor_settings_coauthoring_url');var cfgSpellcheckerUrl = config_server.get('editor_settings_spellchecker_url');var cfgAnalyticsEnable = config_server.get('editor_settings_analytics_enable');var cfgActiveConnectionsTrackingInterval = config_server.get('license_activeconnections_tracking_interval');var cfgReaderFormats = config_server.get('editor_settings_readerformats');var cfgEditorFormats = config_server.get('editor_settings_editorformats');var cfgViewerFormats = config_server.get('editor_settings_viewerformats');var cfgTypesUpload = config_utils.get('limits_image_types_upload');var cfgTypesCopy = config_utils.get('limits_image_types_copy');var cfgImageSize = config_server.get('limits_image_size');var cfgImageDownloadTimeout = config_server.get('limits_image_download_timeout');var cfgLicensePath = config_server.has('license_file_path') ? config_server.get('license_file_path') : '';var SAVE_TYPE_PART_START = 0;var SAVE_TYPE_PART = 1;var SAVE_TYPE_COMPLETE = 2;var SAVE_TYPE_COMPLETE_ALL = 3;var WAIT_OPEN_LICENSE_DELAY = 500;var clientStatsD = statsDClient.getClient();cfgLicensePath = '' === cfgLicensePath ? __dirname + '../../../license.lic' : cfgLicensePath;var g_oLicenseInfo = null;utils.spawn(function* () {  try {    logger.debug('start license read');    g_oLicenseInfo = yield* licenseReader.createLicenseInfo(cfgLicensePath);    logger.debug(g_oLicenseInfo);    logger.debug('end license read');  } catch (e) {    logger.error('error init:\r\n%s', e.stack);  }});function* getRights(cmd) {  while (null === g_oLicenseInfo) {    yield utils.sleep(WAIT_OPEN_LICENSE_DELAY);  }  var oLicenseMetaData = new licenseReader.LicenseMetaData();  oLicenseMetaData.init(cmd.getVKey(), cmd.getDocId(), cmd.getUserId(), cmd.getEditorId());  return yield* g_oLicenseInfo.getRights(oLicenseMetaData);}function OutputDataWrap(type, data) {  this['type'] = type;  this['data'] = data;}OutputDataWrap.prototype = {  fromObject: function(data) {    this['type'] = data['type'];    this['data'] = new OutputData();    this['data'].fromObject(data['data']);  },  getType: function() {    return this['type'];  },  setType: function(data) {    this['type'] = data;  },  getData: function() {    return this['data'];  },  setData: function(data) {    this['data'] = data;  }};function OutputData(type) {  this['type'] = type;  this['status'] = undefined;  this['data'] = undefined;}OutputData.prototype = {  fromObject: function(data) {    this['type'] = data['type'];    this['status'] = data['status'];    this['data'] = data['data'];  },  getType: function() {    return this['type'];  },  setType: function(data) {    this['type'] = data;  },  getStatus: function() {    return this['status'];  },  setStatus: function(data) {    this['status'] = data;  },  getData: function() {    return this['data'];  },  setData: function(data) {    this['data'] = data;  }};function OutputSettingsData(rights, format, trackingInfo) {  this['canLicense'] = true;  this['canEdit'] = true;  this['canDownload'] = true;  this['canCoAuthoring'] = true;  this['canReaderMode'] = true;  this['canAd'] = true;  this['canBranding'] = true;  this['isAutosaveEnable'] = cfgAutoSaveEnable || true;  this['AutosaveMinInterval'] = cfgAutoSaveMinInterval || 300;  this['g_cAscCoAuthoringUrl'] = cfgCoauthoringUrl || ''; //так имена переменных написаны в JS  this['g_cAscSpellCheckUrl'] = cfgSpellcheckerUrl || ''; //чтобы не светить лишние имена здесь используются такие же.  this['isAnalyticsEnable'] = cfgAnalyticsEnable || false;  this['trackingInfo'] = undefined;  this['TrackingInterval'] = cfgActiveConnectionsTrackingInterval || 300;  if (format) {    format = format.toLowerCase();    var readerFormats = cfgReaderFormats || '';    var readerFormatsArray = readerFormats.split(/[|,;]/);    this['canReaderMode'] = -1 != readerFormatsArray.indexOf(format);    var editorformats = cfgEditorFormats || '';    var editorformatsArray = editorformats.split(/[|,;]/);    this['canEdit'] = -1 != editorformatsArray.indexOf(format);    var viewerformats = cfgViewerFormats || '';    var viewerformatsArray = viewerformats.split(/[|,;]/);    this['canDownload'] = -1 != viewerformatsArray.indexOf(format);  }  if (rights) {    this['canEdit'] = rights.canSave;    this['canCoAuthoring'] = rights.canCoAuthoring;    this['canBranding'] = rights.canBranding;    this['canDownload'] = rights.canExport;    this['canLicense'] = rights.canCoAuthoring;  } else {    this['canLicense'] = false;  }  if (trackingInfo) {    //todo  }}function OutputSfcData() {  this['key'] = undefined;  this['status'] = undefined;  this['url'] = undefined;  this['changesurl'] = undefined;  this['changeshistory'] = undefined;  this['users'] = [];  this['mailMerge'] = undefined;}OutputSfcData.prototype = {  getKey: function() {    return this['key'];  },  setKey: function(data) {    return this['key'] = data;  },  getStatus: function() {    return this['status'];  },  setStatus: function(data) {    return this['status'] = data;  },  getUrl: function() {    return this['url'];  },  setUrl: function(data) {    return this['url'] = data;  },  getChangeUrl: function() {    return this['changesurl'];  },  setChangeUrl: function(data) {    return this['changesurl'] = data;  },  getChangeHistory: function() {    return this['changeshistory'];  },  setChangeHistory: function(data) {    return this['changeshistory'] = data;  },  getUsers: function() {    return this['users'];  },  setUsers: function(data) {    return this['users'] = data;  },  getMailMerge: function() {    return this['mailMerge'];  },  setMailMerge: function(data) {    return this['mailMerge'] = data;  }};function OutputMailMerge(mailMergeSendData) {  if (mailMergeSendData) {    this['from'] = mailMergeSendData.getFrom();    this['message'] = mailMergeSendData.getMessage();    this['subject'] = mailMergeSendData.getSubject();    this['title'] = mailMergeSendData.getFileName();    var mailFormat = mailMergeSendData.getMailFormat();    switch (mailFormat) {      case constants.AVS_OFFICESTUDIO_FILE_OTHER_HTMLZIP :        this['type'] = 0;        break;      case constants.AVS_OFFICESTUDIO_FILE_DOCUMENT_DOCX :        this['type'] = 1;        break;      case constants.AVS_OFFICESTUDIO_FILE_CROSSPLATFORM_PDF :        this['type'] = 2;        break;      default :        this['type'] = 0;        break;    }    this['recordCount'] = mailMergeSendData.getRecordCount();    this['to'] = null;    this['recordIndex'] = null;  } else {    this['from'] = null;    this['message'] = null;    this['subject'] = null;    this['title'] = null;    this['to'] = null;    this['type'] = null;    this['recordCount'] = null;    this['recordIndex'] = null;  }}OutputMailMerge.prototype = {  getRecordIndex: function() {    return this['recordIndex'];  },  setRecordIndex: function(data) {    return this['recordIndex'] = data;  },  getTo: function() {    return this['to'];  },  setTo: function(data) {    return this['to'] = data;  }};function getInsertStatisticString(affiliateId, filename, tag) {  var dateNow = sqlBase.getDateTime(new Date());  var commandArg = [affiliateId, filename, dateNow, tag];  var commandArgEsc = commandArg.map(function(curVal) {    return sqlBase.baseConnector.sqlEscape(curVal)  });  return 'INSERT INTO file_statistic2 (fsc_affiliate, fsc_filename, fsc_time, fsc_tag) ' +    'VALUES (' + commandArgEsc.join(', ') + ');';}function insertStatistic(affiliateId, filename, tag) {  return new Promise(function(resolve, reject) {    var sqlCommand = getInsertStatisticString(affiliateId, filename, tag);    sqlBase.baseConnector.sqlQuery(sqlCommand, function(error, result) {      if (error) {        reject(error);      } else {        resolve(result);      }    });  });}function* getOutputData(cmd, outputData, key, status, statusInfo, optConn, optAdditionalOutput) {  switch (status) {    case taskResult.FileStatus.Ok:      //todo affilate      var tag;      var affiliateId = 'affiliateId';      switch (cmd.getEditorId()) {//        case (int)LicenseInfo.EditorType.Spreadsheet: tag = 'open_sheet'; break;//        case (int)LicenseInfo.EditorType.Presentation: tag = 'open_presentation'; break;        default:          tag = 'open_word';          break;      }      yield insertStatistic(affiliateId, cmd.getDocId(), tag);      outputData.setStatus('ok');      if (optConn) {        outputData.setData(yield storage.getSignedUrls(optConn.baseUrl, key));      } else if (optAdditionalOutput) {        optAdditionalOutput.needUrlKey = key;        optAdditionalOutput.needUrlMethod = 0;      }      break;    case taskResult.FileStatus.NeedParams:      outputData.setStatus('needparams');      var settingsPath = key + '/' + 'settings.json';      if (optConn) {        outputData.setData(yield storage.getSignedUrl(optConn.baseUrl, settingsPath));      } else if (optAdditionalOutput) {        optAdditionalOutput.needUrlKey = settingsPath;        optAdditionalOutput.needUrlMethod = 1;      }      break;    case taskResult.FileStatus.Err:    case taskResult.FileStatus.ErrToReload:      outputData.setStatus('err');      outputData.setData(statusInfo);      break;    case taskResult.FileStatus.SaveVersion:    case taskResult.FileStatus.UpdateVersion:      outputData.setStatus('updateversion');      break;  }}function* addRandomKeyTaskCmd(cmd) {  var task = yield* taskResult.addRandomKeyTask(cmd.getDocId());  cmd.setSaveKey(task.key);}function* saveParts(cmd) {  var result = false;  var saveType = cmd.getSaveType();  var filename;  if (SAVE_TYPE_COMPLETE_ALL === saveType) {    filename = 'Editor.bin';  } else {    filename = 'Editor' + (cmd.getSaveIndex() || '') + '.bin';  }  if (SAVE_TYPE_PART_START === saveType || SAVE_TYPE_COMPLETE_ALL === saveType) {    yield* addRandomKeyTaskCmd(cmd);  }  if (cmd.getUrl()) {    result = true;  } else {    var buffer = cmd.getData();    yield storage.putObject(cmd.getSaveKey() + '/' + filename, buffer, buffer.length);    //delete data to prevent serialize into json    cmd.data = null;    result = (SAVE_TYPE_COMPLETE_ALL === saveType || SAVE_TYPE_COMPLETE === saveType);  }  return result;}function getSaveTask(cmd) {  cmd.setData(null);  var queueData = new commonDefines.TaskQueueData();  queueData.setCmd(cmd);  queueData.setToFile('output.' + formatChecker.getStringFromFormat(cmd.getOutputFormat()));  //todo paid  //if (cmd.vkey) {  //  bool  //  bPaid;  //  Signature.getVKeyParams(cmd.vkey, out bPaid);  //  oTaskQueueData.m_bPaid = bPaid;  //}  return queueData;}function getUpdateResponse(cmd) {  var updateTask = new taskResult.TaskResultData();  updateTask.key = cmd.getSaveKey() ? cmd.getSaveKey() : cmd.getDocId();  var statusInfo = cmd.getStatusInfo();  if (constants.NO_ERROR == statusInfo) {    updateTask.status = taskResult.FileStatus.Ok;  } else if (constants.CONVERT_DOWNLOAD == statusInfo) {    updateTask.status = taskResult.FileStatus.ErrToReload;  } else {    updateTask.status = taskResult.FileStatus.Err;  }  updateTask.statusInfo = statusInfo;  if (cmd.getTitle()) {    updateTask.title = cmd.getTitle();  }  return updateTask;}function* commandOpen(conn, cmd, outputData) {  var task = new taskResult.TaskResultData();  task.key = cmd.getDocId();  task.format = cmd.getFormat();  task.status = taskResult.FileStatus.WaitQueue;  task.statusInfo = constants.NO_ERROR;  task.title = cmd.getTitle();  var upsertRes = yield taskResult.upsert(task);  //var bCreate = (upsertRes.affectedRows == 1);  var bExist = (upsertRes.affectedRows > 1);  if (bExist) {    var selectRes = yield taskResult.select(task);    if (selectRes.length > 0) {      var row = selectRes[0];      yield* getOutputData(cmd, outputData, cmd.getDocId(), row.tr_status, row.tr_status_info, conn);    }  } else {    //add task    cmd.setOutputFormat(constants.AVS_OFFICESTUDIO_FILE_CANVAS);    cmd.setEmbeddedFonts(false);    var dataQueue = new commonDefines.TaskQueueData();    dataQueue.setCmd(cmd);    dataQueue.setToFile('Editor.bin');    yield* docsCoServer.addTask(dataQueue, constants.QUEUE_PRIORITY_HIGH);  }}function* commandReopen(cmd) {  var task = new taskResult.TaskResultData();  task.status = taskResult.FileStatus.WaitQueue;  task.statusInfo = constants.NO_ERROR;  var upsertRes = yield taskResult.update(task);  if (upsertRes.affectedRows > 1) {    //add task    cmd.setSaveKey(cmd.getDocId());    cmd.setOutputFormat(constants.AVS_OFFICESTUDIO_FILE_CANVAS);    cmd.setEmbeddedFonts(false);    var dataQueue = new commonDefines.TaskQueueData();    dataQueue.setCmd(cmd);    dataQueue.setToFile('Editor.bin');    dataQueue.setFromSettings(true);    yield* docsCoServer.addTask(dataQueue, constants.QUEUE_PRIORITY_HIGH);  }}function* commandSave(cmd, outputData) {  var completeParts = yield* saveParts(cmd);  if (completeParts) {    var queueData = getSaveTask(cmd);    yield* docsCoServer.addTask(queueData, constants.QUEUE_PRIORITY_LOW);  }  outputData.setStatus('ok');  outputData.setData(cmd.getSaveKey());}function* commandSendMailMerge(cmd, outputData) {  var completeParts = yield* saveParts(cmd);  var isErr = false;  if (completeParts) {    isErr = true;    var getRes = yield* docsCoServer.getCallback(cmd.getDocId());    if (getRes) {      var mailMergeSend = cmd.getMailMergeSend();      mailMergeSend.setUrl(getRes.server.href);      mailMergeSend.setBaseUrl(getRes.baseUrl);      //меняем JsonKey и SaveKey, новый key нужет потому что за одну конвертацию делается часть, а json нужен всегда      mailMergeSend.setJsonKey(cmd.getSaveKey());      yield* addRandomKeyTaskCmd(cmd);      var queueData = getSaveTask(cmd);      yield* docsCoServer.addTask(queueData, constants.QUEUE_PRIORITY_LOW);      isErr = false;    }  }  if (isErr) {    outputData.setStatus('err');    outputData.setData(constants.UNKNOWN);  } else {    outputData.setStatus('ok');    outputData.setData(cmd.getSaveKey());  }}function* commandSfct(cmd, outputData) {  yield* addRandomKeyTaskCmd(cmd);  var queueData = getSaveTask(cmd);  queueData.setFromChanges(true);  yield* docsCoServer.addTask(queueData, constants.QUEUE_PRIORITY_LOW);  outputData.setStatus('ok');}function* commandImgurls(conn, cmd, outputData) {  var supportedFormats;  var urls;  if ('imgurl' == cmd.getCommand()) {    urls = [cmd.getData()];    supportedFormats = cfgTypesUpload || 'jpg';  } else {    urls = cmd.getData();    supportedFormats = cfgTypesCopy || 'jpg';  }  //todo Promise.all()  var imageCount = 0;  var outputUrls = [];  for (var i = 0; i < urls.length; ++i) {    var url = urls[i];    var data = undefined;    if (url.startsWith('data:')) {      var delimiterIndex = url.indexOf(',');      if (-1 != delimiterIndex && (url.length - (delimiterIndex + 1)) * 0.75 <= cfgImageSize) {        data = new Buffer(url.substring(delimiterIndex + 1), 'base64');      }    } else {      //todo stream      data = yield utils.downloadUrlPromise(url, cfgImageDownloadTimeout * 1000, cfgImageSize);    }    var outputUrl = {url: null, path: null};    if (data) {      var format = formatChecker.getFileFormat(data);      var formatStr = formatChecker.getStringFromFormat(format);      if (-1 !== supportedFormats.indexOf(formatStr)) {        var userid = cmd.getUserId();        var imageIndex = cmd.getSaveIndex() + imageCount;        imageCount++;        var strLocalPath = 'media/' + utils.crc32(userid).toString(16) + '_image' + imageIndex + '.' + formatStr;        var strPath = cmd.getDocId() + '/' + strLocalPath;        yield storage.putObject(strPath, data, data.length);        var imgUrl = yield storage.getSignedUrl(conn.baseUrl, strPath);        outputUrl = {url: imgUrl, path: strLocalPath};      }    }    outputUrls.push(outputUrl);  }  outputData.setStatus('ok');  outputData.setData(outputUrls);}function* commandSaveFromOrigin(conn, cmd) {  yield* addRandomKeyTaskCmd(cmd);  cmd.setOutputFormat(constants.AVS_OFFICESTUDIO_FILE_CROSSPLATFORM_PDF);  cmd.setUserConnectionId(conn.user.id);  var queueData = getSaveTask(cmd);  queueData.setFromOrigin(true);  yield* docsCoServer.addTask(queueData, constants.QUEUE_PRIORITY_LOW);}function* commandGetSettings(cmd, outputData) {  //todo license  outputData.setStatus('ok');  var oRights = yield* getRights(cmd);  outputData.setData(new OutputSettingsData(oRights.data, cmd.getFormat()));}function* commandSfcCallback(cmd) {  logger.debug('Start commandSfcCallback docId = %s', cmd.getDocId());  var docId = cmd.getDocId();  var saveKey = cmd.getSaveKey();  var statusInfo = cmd.getStatusInfo();  var getRes = yield* docsCoServer.getCallback(docId);  if (getRes) {    logger.debug('commandSfcCallback docId = %s callback = %s', docId, getRes.server.href);    var outputSfc = new OutputSfcData();    outputSfc.setKey(docId);    if (cmd.getUserId()) {      outputSfc.setUsers([cmd.getUserId()]);    }    if (constants.NO_ERROR != statusInfo && constants.CONVERT_CORRUPTED != statusInfo) {      outputSfc.setStatus(docsCoServer.c_oAscServerStatus.Corrupted);    } else {      try {        var data = yield storage.getObject(saveKey + '/changesHistory.json');        outputSfc.setChangeHistory(data.toString('utf-8'));        outputSfc.setUrl(yield storage.getSignedUrl(getRes.baseUrl, saveKey + '/' + cmd.getTitle()));        outputSfc.setChangeUrl(yield storage.getSignedUrl(getRes.baseUrl, saveKey + '/changes.zip'));      } catch (e) {        logger.error('error commandSfcCallback: docId = %s\r\n%s', docId, e.stack);      }      if (outputSfc.getUrl() && outputSfc.getUsers().length > 0) {        outputSfc.setStatus(docsCoServer.c_oAscServerStatus.MustSave);      } else {        outputSfc.setStatus(docsCoServer.c_oAscServerStatus.Corrupted);      }    }    //if anybody in document stop save    var hasEditors = yield* docsCoServer.hasEditors(docId);    logger.debug('commandSfcCallback docId = %s hasEditors = %d', docId, hasEditors);    if (!hasEditors) {      yield docsCoServer.sendServerRequestPromise(getRes.server, JSON.stringify(outputSfc));      yield* docsCoServer.deleteCallback(docId);    }  }  logger.debug('End commandSfcCallback docId = %s', cmd.getDocId());}function* commandSendMMCallback(cmd) {  logger.debug('Start commandSendMMCallback docId = %s', cmd.getDocId());  var docId = cmd.getDocId();  var saveKey = cmd.getSaveKey();  var statusInfo = cmd.getStatusInfo();  var outputSfc = new OutputSfcData();  outputSfc.setKey(docId);  if (constants.NO_ERROR == statusInfo) {    outputSfc.setStatus(docsCoServer.c_oAscServerStatus.MailMerge);  } else {    outputSfc.setStatus(docsCoServer.c_oAscServerStatus.Corrupted);  }  var mailMergeSendData = cmd.getMailMergeSend();  var outputMailMerge = new OutputMailMerge(mailMergeSendData);  outputSfc.setMailMerge(outputMailMerge);  outputSfc.setUsers([mailMergeSendData.getUserId()]);  var data = yield storage.getObject(saveKey + '/' + cmd.getTitle());  var xml = data.toString('utf8');  var files = xml.match(/[< ]file.*?\/>/g);  var recordRemain = (mailMergeSendData.getRecordTo() - mailMergeSendData.getRecordFrom() + 1);  var recordIndexStart = mailMergeSendData.getRecordCount() - recordRemain;  for (var i = 0; i < files.length; ++i) {    var file = files[i];    var fieldRes = /field=["'](.*?)["']/.exec(file);    outputMailMerge.setTo(fieldRes[1]);    outputMailMerge.setRecordIndex(recordIndexStart + i);    var pathRes = /path=["'](.*?)["']/.exec(file);    var url = yield storage.getSignedUrl(mailMergeSendData.getBaseUrl(), saveKey + '/' + pathRes[1]);    outputSfc.setUrl(url);    var server = docsCoServer.parseUrl(mailMergeSendData.getUrl());    yield docsCoServer.sendServerRequestPromise(server, JSON.stringify(outputSfc));  }  var newRecordFrom = mailMergeSendData.getRecordFrom() + Math.max(files.length, 1);  if (newRecordFrom <= mailMergeSendData.getRecordTo()) {    mailMergeSendData.setRecordFrom(newRecordFrom);    yield* addRandomKeyTaskCmd(cmd);    var queueData = getSaveTask(cmd);    yield* docsCoServer.addTask(queueData, constants.QUEUE_PRIORITY_LOW);  } else {    logger.debug('End MailMerge docId = %s', cmd.getDocId());  }  logger.debug('End commandSendMMCallback docId = %s', cmd.getDocId());}exports.openDocument = function(conn, input) {  utils.spawn(function* () {    var outputData;    try {      var startDate = null;      if(clientStatsD) {        startDate = new Date();      }      var cmd = new commonDefines.InputCommand(input.message);      logger.debug('Start command %s', JSON.stringify(cmd));      outputData = new OutputData(cmd.getCommand());      switch (cmd.getCommand()) {        case 'open':          yield* commandOpen(conn, cmd, outputData);          break;        case 'reopen':          yield* commandReopen(cmd);          break;        case 'savefromorigin':          yield* commandSaveFromOrigin(conn, cmd);          break;        case 'imgurl':        case 'imgurls':          yield* commandImgurls(conn, cmd, outputData);          break;        case 'getsettings':          yield* commandGetSettings(cmd, outputData);          break;        default:          outputData.setStatus('err');          outputData.setData(constants.UNKNOWN);          break;      }      if(clientStatsD) {        clientStatsD.timing('coauth.openDocument.' + cmd.getCommand(), new Date() - startDate);      }    }    catch (e) {      logger.error('error openDocument: docId = %s type = %s\r\n%s',        conn ? conn.docId : 'null', (input && input.type) ? input.type : 'null', e.stack);      if (!outputData) {        outputData = new OutputData();      }      outputData.setStatus('err');      outputData.setData(constants.UNKNOWN);    }    finally {      if (outputData && outputData.getStatus()) {        logger.debug('Response command %s', JSON.stringify(outputData));        docsCoServer.sendData(conn, new OutputDataWrap('documentOpen', outputData));      }      logger.debug('End command');    }  });};exports.downloadAs = function(req, res) {  utils.spawn(function* () {    try {      var startDate = null;      if(clientStatsD) {        startDate = new Date();      }      logger.debug('Start downloadAs request');      var strCmd = req.query['cmd'];      var cmd = new commonDefines.InputCommand(JSON.parse(strCmd));      logger.debug('downloadAs cmd: %s', strCmd);      cmd.setData(req.body);      var outputData = new OutputData(cmd.getCommand());      switch (cmd.getCommand()) {        case 'save':          yield* commandSave(cmd, outputData);          break;        case 'sendmm':          yield* commandSendMailMerge(cmd, outputData);          break;        case 'sfct':          yield* commandSfct(cmd, outputData);          break;        default:          outputData.setStatus('err');          outputData.setData(constants.UNKNOWN);          break;      }      var strRes = JSON.stringify(outputData);      res.send(strRes);      logger.debug('End downloadAs request: %s', strRes);      if(clientStatsD) {        clientStatsD.timing('coauth.downloadAs.' + cmd.getCommand(), new Date() - startDate);      }    }    catch (e) {      logger.error('error downloadAs:\r\n%s', e.stack);      res.sendStatus(400);    }  });};exports.saveFromChanges = function(docId, optFormat) {  utils.spawn(function* () {    try {      var startDate = null;      if(clientStatsD) {        startDate = new Date();      }      logger.debug('Start saveFromChanges docId = %s', docId);      if (null == optFormat) {        optFormat = constants.AVS_OFFICESTUDIO_FILE_OTHER_TEAMLAB_INNER;      }      var cmd = new commonDefines.InputCommand();      cmd.setCommand('sfc');      cmd.setDocId(docId);      cmd.setOutputFormat(optFormat);      yield* addRandomKeyTaskCmd(cmd);      var queueData = getSaveTask(cmd);      queueData.setFromChanges(true);      yield* docsCoServer.addTask(queueData, constants.QUEUE_PRIORITY_NORMAL);      logger.debug('addTask saveFromChanges docId = %s', docId);      if(clientStatsD) {        clientStatsD.timing('coauth.saveFromChanges', new Date() - startDate);      }    }    catch (e) {      logger.error('error saveFromChanges: docId = %s\r\n%s', docId, e.stack);    }  });};exports.receiveTask = function(data, dataRaw) {  utils.spawn(function* () {    try {      var task = new commonDefines.TaskQueueData(JSON.parse(data));      if (task) {        var cmd = task.getCmd();        logger.debug('Start receiveTask command %s', JSON.stringify(cmd));        var updateTask = getUpdateResponse(cmd);        var updateRes = yield taskResult.update(updateTask);        if (updateRes.affectedRows > 0) {          var outputData = new OutputData(cmd.getCommand());          var command = cmd.getCommand();          var additionalOutput = {needUrlKey: null, needUrlMethod: null};          if ('open' == command || 'reopen' == command) {            yield* getOutputData(cmd, outputData, cmd.getDocId(), updateTask.status,              updateTask.statusInfo, null, additionalOutput);          } else if ('save' == command || 'savefromorigin' == command || 'sfct' == command) {            yield* getOutputData(cmd, outputData, cmd.getSaveKey(), updateTask.status,              updateTask.statusInfo, null, additionalOutput);          } else if ('sfc' == command) {            yield* commandSfcCallback(cmd);          } else if ('sendmm' == command) {            yield* commandSendMMCallback(cmd);          } else if ('conv' == command) {            //nothing          }          if (outputData.getStatus()) {            logger.debug('send receiveTask %s', JSON.stringify(outputData));            var output = new OutputDataWrap('documentOpen', outputData);            yield* docsCoServer.publish({              type: docsCoServer.PublishType.receiveTask, cmd: cmd, output: output,              needUrlKey: additionalOutput.needUrlKey, needUrlMethod: additionalOutput.needUrlMethod            });          }        }        yield* docsCoServer.removeResponse(dataRaw);        logger.debug('End receiveTask command %s', JSON.stringify(cmd));      }    } catch (err) {      logger.error(err);    }  });};exports.OutputDataWrap = OutputDataWrap;exports.OutputData = OutputData;