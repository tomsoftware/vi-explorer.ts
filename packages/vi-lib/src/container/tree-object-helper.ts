
export class TreeObjectHelper {
  private static objectTypeNames: { [key: number]: string } = {
    '-7': 'SL__rootObject',
    '-6': 'SL__arrayElement',
    '-5': 'SL__array',
    '-4': 'SL__reference',
    '-3': 'SL__object',

    1: 'activeDiag', // 0
    2: 'activeMarker', // 1
    3: 'activePlot', // 2
    4: 'activeThumb', // 3
    5: 'activeXScale', // 4
    6: 'activeYScale', // 5
    7: 'alarmName', // 6
    8: 'bary', // 7
    9: 'bgColor', // 8
    10: 'bindings', // 9
    11: 'blinkList', // 10
    12: 'borderColor', // 11
    13: 'botOrRight', // 12
    14: 'bounds', // 13
    15: 'buf', // 14
    16: 'callOffset', // 15
    17: 'callType', // 16
    18: 'callee', // 17
    19: 'caller', // 18
    20: 'callerGlyphBounds', // 19
    21: 'caseSelDCO', // 20
    22: 'cboxDsOffset', // 21
    23: 'cboxTdOffset', // 22
    24: 'cbrIcon', // 23
    25: 'cinPath', // 24
    26: 'className', // 25
    27: 'clumpNum', // 26
    28: 'cnst', // 27
    29: 'code', // 28
    30: 'color', // 29
    31: 'colorDSO', // 30
    32: 'colorTDO', // 31
    33: 'cols', // 32
    34: 'commentMode', // 33
    35: 'companionDiag', // 34
    36: 'conId', // 35
    37: 'conNum', // 36
    38: 'conPane', // 37
    39: 'confState', // 38
    40: 'configNode', // 39
    41: 'connectorTM', // 40
    42: 'cons', // 41
    43: 'contRect', // 42
    44: 'ctlDataObj', // 43
    45: 'dBounds', // 44
    46: 'dIdx', // 45
    47: 'dataNodeList', // 46
    48: 'dco', // 47
    49: 'dcoAgg', // 48
    50: 'dcoFiller', // 49
    51: 'dcoList', // 50
    52: 'ddo', // 51
    53: 'ddoIndex', // 52
    54: 'ddoList', // 53
    55: 'ddoListList', // 54
    56: 'defaultDiag', // 55
    57: 'delDCO', // 56
    58: 'depth', // 57
    59: 'description', // 58
    60: 'diagDefined', // 59
    61: 'diagFiller1', // 60
    62: 'diagFiller2', // 61
    63: 'diagramList', // 62
    64: 'docBounds', // 63
    65: 'dsOffset', // 64
    66: 'dsw', // 65
    67: 'dynBounds', // 66
    68: 'dynLink', // 67
    69: 'eOracleIdx', // 68
    70: 'ePtrOff', // 69
    71: 'eSizeOff', // 70
    72: 'eltDCO', // 71
    73: 'embedToken', // 72
    74: 'errCode', // 73
    75: 'errIn', // 74
    76: 'errOfst', // 75
    77: 'errOut', // 76
    78: 'eventObj_unused', // 77
    79: 'fName', // 78
    80: 'fgColor', // 79
    81: 'filler', // 80
    82: 'filterNodeList', // 81
    83: 'firstNodeIdx', // 82
    84: 'focusRow', // 83
    85: 'format', // 84
    86: 'formula', // 85
    87: 'frontRow', // 86
    88: 'funcTD', // 87
    89: 'graphCursor', // 88
    90: 'graphType', // 89
    91: 'growAreaBounds', // 90
    92: 'growObj', // 91
    93: 'growTermsList', // 92
    94: 'growViewObj', // 93
    95: 'hFlags', // 94
    96: 'hGrowNodeList', // 95
    97: 'hSEnd', // 96
    98: 'hSStart', // 97
    99: 'headerImage', // 98
    100: 'hierarchyColor', // 99
    101: 'histDSOffset', // 100
    102: 'histTD', // 101
    103: 'histTDOffset', // 102
    104: 'hoodBounds', // 103
    105: 'hotPoint', // 104
    106: 'howGrow', // 105
    107: 'i', // 106
    108: 'iconBounds', // 107
    109: 'id', // 108
    110: 'image', // 109
    111: 'inArrDCO', // 110
    112: 'inVILib', // 111
    113: 'index', // 112
    114: 'indexPosCol', // 113
    115: 'indexPosRow', // 114
    116: 'indexing', // 115
    117: 'innerLpTunDCO', // 116
    118: 'innerR', // 117
    119: 'innerSeq', // 118
    120: 'inplace', // 119
    121: 'instance', // 120
    122: 'instanceSelector', // 121
    123: 'instrStyle', // 122
    124: 'intermediateList', // 123
    125: 'invokeFlags', // 124
    126: 'keyMappingList', // 125
    127: 'label', // 126
    128: 'lastSignalKind', // 127
    129: 'legendLbl', // 128
    130: 'lenDCO', // 129
    131: 'lengthDCOList', // 130
    132: 'level', // 131
    133: 'libPath', // 132
    134: 'listFlags', // 133
    135: 'listboxFlags', // 134
    136: 'loopEndDCO', // 135
    137: 'loopIndexDCO', // 136
    138: 'loopTimingDCO', // 137
    139: 'lpTunDCO', // 138
    140: 'lsrDCOList', // 139
    141: 'mJasterWizard', // 140
    142: 'mask', // 141
    143: 'master_unused', // 142
    144: 'masterPart', // 143
    145: 'mate', // 144
    146: 'maxPaneSize', // 145
    147: 'maxPanelSize', // 146
    148: 'mclFlags', // 147
    149: 'menuInstanceUsed', // 148
    150: 'methCode', // 149
    151: 'methName', // 150
    152: 'minPaneSize', // 151
    153: 'minPanelSize', // 152
    154: 'nChunks', // 153
    155: 'nConnections', // 154
    156: 'nDims', // 155
    157: 'nInputs', // 156
    158: 'nLabels', // 157
    159: 'nMajDivs', // 158
    160: 'nRC', // 159
    161: 'nVisItems', // 160
    162: 'nmxFiller', // 161
    163: 'nodeInfo', // 162
    164: 'nodeList', // 163
    165: 'nodeName', // 164
    166: 'numFrozenCols', // 165
    167: 'numFrozenRows', // 166
    168: 'numRows', // 167
    169: 'numSubVIs', // 168
    170: 'oMId', // 169
    171: 'oRC', // 170
    172: 'objFlags', // 171
    173: 'omidDSOffset', // 172
    174: 'omidTDOffset', // 173
    175: 'omidTypeDesc', // 174
    176: 'orderList', // 175
    177: 'origin', // 176
    178: 'otherSide', // 177
    179: 'outerR', // 178
    180: 'outputDCO', // 179
    181: 'outputNode', // 180
    182: 'ownerSignal', // 181
    183: 'pBounds', // 182
    184: 'pMap', // 183
    185: 'pMapOfst', // 184
    186: 'pageList', // 185
    187: 'paneFlags', // 186
    188: 'paneHierarchy', // 187
    189: 'paramIdx', // 188
    190: 'paramTableOffset', // 189
    191: 'parmIndex', // 190
    192: 'partID', // 191
    193: 'partOrder', // 192
    194: 'partsList', // 193
    195: 'pattern', // 194
    196: 'pctTransparent', // 195
    197: 'permDCOList', // 196
    198: 'permutation', // 197
    199: 'pixmap', // 198
    200: 'pos', // 199
    201: 'preferredInstIndex', // 200
    202: 'primIndex', // 201
    203: 'primResID', // 202
    204: 'priv', // 203
    205: 'privDataList', // 204
    206: 'propList', // 205
    207: 'refList', // 206
    208: 'resetJumpLabel', // 207
    209: 'revisionInfoCreator', // 208
    210: 'revisionInfoTlkitID', // 209
    211: 'revisionInfoTlkitVersion', // 210
    212: 'ringDsOffset', // 211
    213: 'ringTdOffset', // 212
    214: 'root', // 213
    215: 'rowHeight', // 214
    216: 'rsrDCO', // 215
    217: 'rsrcID', // 216
    218: 'rtPopupData', // 217
    219: 'rtPopupString', // 218
    220: 'rtPopupVersion', // 219
    221: 'rtdsoff', // 220
    222: 'savedState', // 221
    223: 'screenRes', // 222
    224: 'scriptName', // 223
    225: 'sdllName', // 224
    226: 'selLabData', // 225
    227: 'selString', // 226
    228: 'selectionColor', // 227
    229: 'seqLocDCOList', // 228
    230: 'sequenceList', // 229
    231: 'shortCount', // 230
    232: 'signalIndex', // 231
    233: 'signalList', // 232
    234: 'simDiagFlags', // 233
    235: 'simparam', // 234
    236: 'simtype', // 235
    237: 'simulationDiag', // 236
    238: 'sizeRect', // 237
    239: 'slaveList_unused', // 238
    240: 'slocFiller', // 239
    241: 'snFiller', // 240
    242: 'splitterFlags', // 241
    243: 'srDCOList', // 242
    244: 'srcDCO', // 243
    245: 'stamp', // 244
    246: 'state', // 245
    247: 'stateTD', // 246
    248: 'streamData', // 247
    249: 'strings', // 248
    250: 'structColor', // 249
    251: 'subPanelFlags', // 250
    252: 'subVIGlyphBounds', // 251
    253: 'symmetry', // 252
    254: 'tInset', // 253
    255: 'tabWidth', // 254
    256: 'table', // 255
    257: 'tableFlags', // 256
    258: 'tagDevice', // 257
    259: 'tagDisplayFilter', // 258
    260: 'tagSubTypeClass', // 259
    261: 'tagType', // 260
    262: 'tagTypeClass', // 261
    263: 'tblOffset', // 262
    264: 'tdOffset', // 263
    265: 'termBMPs', // 264
    266: 'termBounds', // 265
    267: 'termHotPoint', // 266
    268: 'termList', // 267
    269: 'textDivider', // 268
    270: 'textRec', // 269
    271: 'threadInfo', // 270
    272: 'timeDataNodeDMux', // 271
    273: 'timeDataNodeMux', // 272
    274: 'timeLoop', // 273
    275: 'timeOutDCO', // 274
    276: 'tool', // 275
    277: 'topOrLeft', // 276
    278: 'treeFlags', // 277
    279: 'tsH', // 278
    280: 'tunnelList', // 279
    281: 'type', // 280
    282: 'typeCode', // 281
    283: 'typeDesc', // 282
    284: 'userDiagram', // 283
    285: 'vTblPtr', // 284
    286: 'varTypeDesc', // 285
    287: 'vblName', // 286
    288: 'version', // 287
    289: 'viPath', // 288
    290: 'viState', // 289
    291: 'visClust', // 290
    292: 'width', // 291
    293: 'winFlags', // 292
    294: 'wireGlyphID', // 293
    295: 'wireID', // 294
    296: 'wireTable', // 295
    297: 'wizData', // 296
    298: 'wizDataH', // 297
    299: 'wizDataID', // 298
    300: 'wizID', // 299
    301: 'wizVersion', // 300
    302: 'xflags', // 301
    303: 'zPlaneList', // 302
    304: 'zPlaneListList', // 303
    305: 'zoom', // 304
    306: 'srcDCO1', // 305
    307: 'srcDCO2', // 306
    308: 'srcDCO3', // 307
    309: 'srcDCO4', // 308
    310: 'cRectAbove', // 309
    311: 'cRectBelow', // 310
    312: 'variantIndex', // 311
    313: 'termListLength', // 312
    314: 'refListLength', // 313
    315: 'hGrowNodeListLength', // 314
    316: 'dataTypeDesc', // 315
    317: 'hair', // 316
    318: 'displayName', // 317
    319: 'selLabFlags', // 318
    320: 'lastSelRow', // 319
    321: 'lastSelCol', // 320
    322: 'scrollPosV', // 321
    323: 'scrollPosH', // 322
    324: 'totalBounds', // 323
    325: 'srcRect', // 324
    326: 'labelPosRow', // 325
    327: 'labelPosCol', // 326
    328: 'simparamOut', // 327
    329: 'innerMate', // 328
    330: 'outerMate', // 329
    331: 'flatSeq', // 330
    332: 'timeSeq', // 331
    333: 'slaveMods', // 332
    334: 'slaveOwner', // 333
    335: 'simConfigNode', // 334
    336: 'simOutputNode', // 335
    337: 'glyphs', // 336
    338: 'pUseStoredSize', // 337
    339: 'pUseStoredPos', // 338
    340: 'pRuntimeType', // 339
    341: 'pRuntimeTop', // 340
    342: 'pRuntimeLeft', // 341
    343: 'pRuntimeWidth', // 342
    344: 'pRuntimeHeight', // 343
    345: 'pRuntimeMonitor', // 344
    346: 'libVersion', // 345
    347: 'ratio', // 346
    348: 'annexDDOFlag', // 347
    349: 'xCtlState', // 348
    350: 'wizList', // 349
    351: 'lockedObjectList', // 350
    352: 'lockedSignalList', // 351
    353: 'masterStateEnum', // 352
    354: '_Quit_StateEnum', // 353
    355: 'stopCodeEnum', // 354
    356: 'stateLoop', // 355
    357: 'stateCase', // 356
    358: 'stateCaseOutputTunnel', // 357
    359: 'stateList', // 358
    360: 'isSubVICall', // 359
    361: 'name', // 360
    362: 'transitionEnum', // 361
    363: 'transitionCase', // 362
    364: 'transCaseOutputTunnel', // 363
    365: 'transitionList', // 364
    366: 'stateBounds', // 365
    367: 'terminal', // 366
    368: 'stateConst', // 367
    369: 'exitAngle', // 368
    370: 'entranceAngle', // 369
    371: 'stiffness', // 370
    372: 'labelPos', // 371
    373: 'pinCorner', // 372
    374: 'currentlyScripting', // 373
    375: 'textNodeLabel', // 374
    376: 'heapFlags', // 375
    377: 'refreshFilter', // 376
    378: 'plugInData', // 377
    379: 'xTunDDO', // 378
    380: 'gridFlags', // 379
    381: 'headerFiles', // 380
    382: 'sceneView', // 381
    383: 'lastAutoScale', // 382
    384: 'autoScaleDelay', // 383
    385: 'reserveCB', // 384
    386: 'unreserveCB', // 385
    387: 'abortCB', // 386
    388: 'paramInfo', // 387
    389: 'extFuncFlags', // 388
    390: 'tMI', // 389
    391: 'lineNumbers', // 390
    392: 'fPath', // 391
    393: 'mDate', // 392
    394: 'errHandle', // 393
    395: 'xTunnelDir', // 394
    396: 'sCFlag', // 395
    397: 'sCStNGuid', // 396
    398: 'sCDiagSubType', // 397
    399: 'sCDiagFlag', // 398
    400: 'isLoopCaseTransition', // 399
    401: 'selectorXNode', // 400
    402: 'iFeedbackLoop', // 401
    403: 'cellPosRow', // 402
    404: 'cellPosCol', // 403
    405: 'font', // 404
    406: 'mode', // 405
    407: 'height', // 406
    408: 'glyphIndex', // 407
    409: 'flags', // 408
    410: 'attributeList', // 409
    411: 'qtWidget', // 410
    412: 'fLoopCondTerm', // 411
    413: 'isInterface', // 412
    414: 'loopLimitDCO', // 413
    415: 'loopTestDCO', // 414
    416: 'overrideType', // 415
    417: 'maxWordLength', // 416
    418: 'override', // 417
    419: 'overflow', // 418
    420: 'quantize', // 419
    421: 'tunOrdList', // 420
    422: 'sceneGLContext', // 421
    423: 'poserList', // 422
    424: 'decomposer', // 423
    425: 'recomposer', // 424
    426: 'arrayDCO', // 425
    427: 'variantDCO', // 426
    428: 'valueDCO', // 427
    429: 'typeDCO', // 428
    430: 'inputDataDCO', // 429
    431: 'outputDataDCO', // 430
    432: 'poser', // 431
    433: 'dataValRefDCO', // 432
    434: 'write', // 433
    435: 'showTimestamp', // 434
    436: 'name', // 435
    437: 'privDataDSO', // 436
    438: 'privDataTMI', // 437
    439: 'disabledList', // 438
    /*
        422: 'multiSegPipeFlange1Size', //439
        423: 'multiSegPipeFlange2Size', //440
        424: 'multiSegPipeFlange1Depth', //441
        425: 'multiSegPipeFlange2Depth', //442
        426: 'multiSegPipeWidth', //443
        427: 'staticState', //444
        428: 'funcName', //445
        429: 'mFilePath', //446
        430: 'tagDLLPath', //447
        430: 'recursiveFunc', //448
        431: 'tagDLLName', //449
        */
    451: 'tunnelLink', // 450
    452: 'activeBus', // 451
    453: 'terminal ID', // 452
    454: 'implementingNode', // 453
    455: 'fboxlineList', // 454
    456: 'compressedWireTable', // 455
    457: 'sharedCloneAllocationFlags', // 456
    458: 'initOrderIndex' // 457
  };

  private static classTypeNames: { [key: number]: string } = {
    0: 'badProc',
    3: 'prNodeList',
    4: 'prFrameList',
    5: 'prVIPartList',
    6: 'generic',
    7: 'list',
    8: 'dataObj',
    9: 'cosm',
    10: 'label',
    11: 'multiCosm',
    12: 'bigMultiCosm',
    13: 'multiLabel',
    14: 'bigMultiLabel',
    17: 'dCO',
    18: 'fPDCO',
    19: 'bDConstDCO',
    20: 'bDDCO',
    21: 'term',
    22: 'fPTerm',
    23: 'signal',
    24: 'wire',
    25: 'hSignal',
    26: 'hNode',
    27: 'diag',
    28: 'node',
    29: 'sRN',
    30: 'sNode',
    31: 'growableNode',
    32: 'forLoop',
    33: 'whileLoop',
    34: 'lpTun',
    35: 'innerLpTun',
    36: 'lCnt',
    37: 'lTst',
    38: 'lMax',
    39: 'lSR',
    40: 'rSR',
    41: 'sequence',
    42: 'seqTun',
    43: 'sLoc',
    44: 'select',
    45: 'selTun',
    46: 'caseSel',
    47: 'prim',
    48: 'parm',
    49: 'iUse',
    50: 'gRef',
    51: 'iUseDCO',
    52: 'mux',
    53: 'mxDCO',
    54: 'demux',
    55: 'dmxDCO',
    56: 'codeVI',
    57: 'codeVIArg',
    58: 'aBuild',
    59: 'aBuildDCO',
    60: 'cABuild',
    61: 'cABuildDCO',
    62: 'concat',
    63: 'concatDCO',
    64: 'decimate',
    65: 'decimateDCO',
    66: 'interLeave',
    67: 'interLeaveDCO',
    68: 'aIndx',
    69: 'aIDCO',
    72: 'subset',
    73: 'subsetDCO',
    74: 'fBox',
    75: 'fBoxDCO',
    76: 'supC',
    77: 'dDO',
    78: 'bDFixed',
    79: 'stdBool',
    80: 'stdNum',
    81: 'stdString',
    82: 'indArr',
    83: 'stdClust',
    84: 'stdVar',
    85: 'stdRefNum',
    86: 'stdColorNum',
    87: 'stdRing',
    88: 'stdSlide',
    89: 'stdKnob',
    91: 'stdPath',
    92: 'stdTable',
    93: 'stdHandle',
    94: 'stdGraph',
    95: 'stdPict',
    96: 'stdPixMap',
    97: 'userItem',
    98: 'nmxDCO',
    99: 'nMux',
    100: 'typeDef',
    101: 'stdRamp',
    102: 'uCast',
    103: 'gRefDCO',
    104: 'annex',
    105: 'stdListbox',
    106: 'extFunc',
    107: 'extFuncArg',
    108: 'cpdArith',
    109: 'cpdArithDCO',
    124: 'crossList',
    126: 'oHExt',
    127: 'conPane',
    128: 'loop',
    129: 'multiDiagSNode',
    130: 'instrTypeRec',
    131: 'typeDesc',
    132: 'editSelectionBkUp',
    133: 'bHExt',
    134: 'transTable',
    135: 'textSelectionBkUp',
    136: 'objInfoTable',
    137: 'recipeBkUp',
    138: 'recipe',
    139: 'dataBkUp',
    140: 'propNode',
    141: 'propItem',
    142: 'hGrowCItem',
    143: 'scale',
    144: 'scanfArg',
    145: 'printfArg',
    146: 'scanf',
    147: 'printf',
    148: 'stdTag',
    149: 'selLabel',
    166: 'wizardData',
    168: 'hGrowNode',
    169: 'invokeNode',
    170: 'invokeItem',
    171: 'oleVariant',
    172: 'grouper',
    173: 'iUseCore',
    174: 'callByRefNode',
    175: 'stdCont',
    176: 'cEData',
    177: 'subVIFromSelBkUp',
    178: 'selListBkUp',
    179: 'sNDCO',
    180: 'scriptNode',
    181: 'stdComboBox',
    182: 'ctlRefConst',
    183: 'ctlRefDCO',
    184: 'stdMeasureData',
    185: 'aReplace',
    186: 'aRepDCO',
    187: 'aInsert',
    188: 'aInsDCO',
    189: 'aDelete',
    190: 'aDelDCO',
    191: 'textNode',
    192: 'exprNode',
    193: 'cLStrObj',
    194: 'stdLvVariant',
    195: 'tabControl',
    196: 'placeholderNode',
    197: 'polyIUse',
    198: 'polyIUseDCO',
    199: 'page',
    200: 'tabArray',
    201: 'part',
    202: 'flatSequence',
    203: 'flatSeqTun',
    204: 'growViewObj',
    205: 'commentNode',
    206: 'commentTun',
    207: 'stdSubPanel',
    208: 'mergeSignal',
    209: 'mergeSignalDCO',
    210: 'grid',
    211: 'splitSignal',
    212: 'splitSignalDCO',
    213: 'eventStruct',
    214: 'eventDataNode',
    215: 'eventDynDCO',
    216: 'eventTimeOut',
    217: 'dropFeedback',
    218: 'masterWiz',
    219: 'subWizard',
    220: 'stateDiagWiz',
    221: 'state',
    222: 'transition',
    223: 'absTime',
    224: 'numLabel',
    225: 'tableControl',
    226: 'digitalTable',
    227: 'externalNode',
    228: 'externalTun',
    229: 'polySelector',
    230: 'listbox',
    231: 'treeControl',
    232: 'externalSignal',
    233: 'baseTableControl',
    234: 'baseListbox',
    235: 'eventRegNode',
    236: 'eventRegItem',
    237: 'constructorNode',
    238: 'plugInDDO',
    239: 'radioClust',
    240: 'externalStructNode',
    241: 'stubDDO',
    242: 'graphSplitBar',
    243: 'eventRItem',
    244: 'eventRegCallback',
    245: 'eventRegCBItem',
    246: 'externalDiagram',
    247: 'subVIFromCodeGenBkUp',
    248: 'oldStatVIRef',
    249: 'lTiming',
    250: 'timeDataNode',
    251: 'timeLoop',
    252: 'timeLoopExtNode',
    253: 'simDiag',
    254: 'simNode',
    255: 'compDiag',
    256: 'simTun',
    257: 'keyMapList',
    258: 'xControl',
    259: 'statVIRef',
    260: 'dynIUse',
    261: 'xNode',
    262: 'xTunnel',
    263: 'xStructure',
    264: 'xDiagram',
    265: 'xSignal',
    266: 'dynPolyIUse',
    267: 'dynLink',
    268: 'udClassDDO',
    269: 'simDCO',
    270: 'baseRefNum',
    271: 'privDataHelper',
    272: 'propItemInfo',
    273: 'axItemInfo',
    274: 'dnetItemInfo',
    275: 'udClassPropItemPrivInfo',
    276: 'aInit',
    277: 'aInitDCO',
    278: 'aReshape',
    279: 'aReshapeDCO',
    280: 'sharedGrowArrayNode',
    281: 'growArrayNode',
    282: 'sharedGrowArrayDCO',
    283: 'growArrayDCO',
    284: 'pane',
    285: 'splitter',
    286: 'dynIUseCore',
    287: 'timeFlatSequenceFrame',
    288: 'xDataNode',
    289: 'sequenceFrame',
    290: 'timeSequence',
    291: 'timeFlatSequence',
    292: 'callParentDynIUse',
    293: 'matedLpTun',
    294: 'matedSeqTun',
    295: 'matedLSR',
    296: 'matedRSR',
    297: 'scrollbar',
    298: 'mathScriptNode',
    299: 'mathScriptNodeDCO',
    300: 'sdfDiag',
    301: 'sdfNode',
    302: 'sdfcompDiag',
    303: 'sdfTun',
    304: 'sdfDCO',
    305: 'scenegraphdisplay',
    306: 'htmlControl',
    307: 'codeWizard',
    308: 'cBoxDPIdx',
    309: 'cBoxDCODPIdx',
    310: 'abstractDiagram',
    311: 'mathDiagram',
    312: 'basicObj',
    313: 'regionNode',
    314: 'stateNode',
    315: 'junctionNode',
    316: 'regionTun',
    317: 'multiSegmentPipe',
    318: 'lDCO',
    319: 'rDCO',
    320: 'forkNode',
    321: 'joinNode',
    322: 'scDiag',
    323: 'indArrInterface',
    324: 'leftFeedback',
    325: 'rightFeedback',
    326: 'initFeedback',
    327: 'qtCont',
    328: 'sharedVariable',
    329: 'sharedVariableDCO',
    330: 'hiddenFBNode',
    331: 'overridableParm',
    332: 'ternaryDDO',
    333: 'decomposeRecomposeStructure',
    334: 'decomposeRecomposeTunnel',
    335: 'decomposeArrayNode',
    336: 'decomposeClusterNode',
    337: 'decomposeVariantNode',
    338: 'decomposeMatchNode',
    339: 'decomposeDataValRefNode',
    340: 'dataValRefPoserInterface',
    341: 'decomposeDCO',
    342: 'decomposeClusterDCO',
    343: 'poserInterface',
    344: 'arrayPoserInterface',
    345: 'clusterPoserInterface',
    346: 'variantPoserInterface',
    347: 'matchPoserInterface',
    349: 'mathScriptCallByRefNode',
    351: 'FBoxLine',
    352: 'sceneGraphDisplayPart',
    353: 'fxpUnbundle',
    354: 'fxpUnbundleDCO'
  };

  public static getObjectNameById(id: number): string {
    const objectName = this.objectTypeNames[id - 31];
    if (objectName == null) {
      return id.toString();
    }

    return id + ':' + objectName;
  }

  public static getClassNameById(classId: number): string {
    const objectName = this.classTypeNames[classId];
    if (objectName == null) {
      return classId.toString();
    }

    return classId + ':' + objectName;
  }
}
