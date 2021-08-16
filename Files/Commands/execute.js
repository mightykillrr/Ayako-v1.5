const Discord = require('discord.js');

module.exports = {
	name: 'execute',
	aliases: ['e'],
	perm: 268435456n, 
	dm: true,
	takesFirstArg: false,
	// eslint-disable-next-line no-unused-vars
	async exe(msg) {
		const users = [ 
			'870646221633626132', 
			'870669778984005652', 
			'870816612234711060', 
			'871262033897734225', 
			'871262421594034277', 
			'871262574837133363', 
			'871288188285616158', 
			'871288188960915506', 
			'871289929265737788', 
			'871290077567934464', 
			'871290338311045130', 
			'871290350709399573', 
			'871290363334258748', 
			'871551006645846036', 
			'871563570385657886', 
			'871565169900290099', 
			'871565837847380000', 
			'871567130095652944', 
			'871568078167740416', 
			'871568719220985896', 
			'871570709871210517', 
			'871574761539526667', 
			'871577190016352276', 
			'871579108801388544', 
			'871579603641196554', 
			'871585445354537042', 
			'871612761627566120', 
			'871614349825949776', 
			'871614661307535430', 
			'871618220820414525', 
			'871619329773408277', 
			'871620541327499325', 
			'871623680462045255', 
			'871627783418298390', 
			'871628961149517924', 
			'871630044999581796', 
			'871630080265293847', 
			'871631387298496524', 
			'871637867401723935', 
			'871641238057672704', 
			'871641990490632223', 
			'871643993430183967', 
			'871644723578806312', 
			'871644956979257415', 
			'871645032178925568', 
			'871645324018606111', 
			'871646294110781440', 
			'871649163492876319', 
			'871650696221589534', 
			'871652122498842624', 
			'871652440628420711', 
			'871652791347712010', 
			'871653945741803520', 
			'871654264953520188', 
			'871654545497931846', 
			'871655128694915102', 
			'871655399684735007', 
			'871655834709545010', 
			'871655886203023360', 
			'871656065547264021', 
			'871656113140011028', 
			'871656688321691709', 
			'871657249897058314', 
			'871658826913431592', 
			'871660938087002123', 
			'871661260889022475', 
			'871663579957440563', 
			'871664381342134272', 
			'871667660625170452', 
			'871670294094430248', 
			'871670763478978610', 
			'871670840595476501', 
			'871670979292700713', 
			'871671474757443654', 
			'871673315759095868', 
			'871674521424379945', 
			'871680409937784832', 
			'871683661718757416', 
			'871684201676681236', 
			'871686026412843019', 
			'871686921385029652', 
			'871689314986229791', 
			'871689663495143464', 
			'871690691292594186', 
			'871694966622126091', 
			'871696077978501150', 
			'871697912546070538', 
			'871701138586615859', 
			'871701177643986944', 
			'871702834935119932', 
			'871703777701404702', 
			'873167489935233034', 
			'873167545702678559', 
			'873167594683781180', 
			'873167803719495731', 
			'873167834786721852', 
			'873167841971560448', 
			'873167979829948426', 
			'873168002579836989', 
			'873168082313547777', 
			'873168277390643220', 
			'873168564465590292', 
			'873168949527871498', 
			'873169083028365322', 
			'873169618418663474', 
			'873169634591916032', 
			'873169702703206420', 
			'873169904222765107', 
			'873169994912002049', 
			'873170328937984030', 
			'873170781096529961', 
			'873171043622219816', 
			'873171196093538324', 
			'873171247809310780', 
			'873171352473972786', 
			'873173927717929042', 
			'874103278886088746', 
			'875021727283949640', 
			'875021932259581973', 
			'875021982830305290', 
			'875022085758529556', 
			'875022107472445490', 
			'875022115319992340', 
			'875022222551552020', 
			'875022267510317066', 
			'875022372858634250', 
			'875022488445263882', 
			'875022815156396104', 
			'875022827651207228', 
			'875022864405905419', 
			'875022960241549333', 
			'875022969691308052', 
			'875023069209567253', 
			'875023092131442719', 
			'875023119474106429', 
			'875023319970222090', 
			'875023431840710719', 
			'875023470025658428', 
			'875454763720908830', 
			'875465162239381504', 
			'875467541571567626', 
			'875551870167420949', 
			'875675793735430145', 
			'875740026766495755', 
			'875740951828652102', 
			'875742292051374180', 
			'875743511713046608', 
			'875749352704999434', 
			'875749627729678336', 
			'875750098246713395', 
			'875750177133199441', 
			'875753568571912232', 
			'875754616044814356', 
			'875755043628908584', 
			'875755915217866772', 
			'875757026469351425', 
			'875758775854841856', 
			'875759084199116841', 
			'875760189003952169', 
			'875761136430108702', 
			'875763314066591765', 
			'875763830934876263', 
			'875764227439226880', 
			'875765550704390154', 
			'875766286888615936', 
			'875769059684278334', 
			'875769120816263210', 
			'875769480523948123', 
			'875769670026788875', 
			'875769909173428245', 
			'875773075076038716', 
			'875773108919861309', 
			'875776318871048206', 
			'875776507920924682', 
			'875777620820783184', 
			'875778972615573575', 
			'875780857992974347', 
			'875782553775251476', 
			'875782769744166945', 
			'875784163901464597', 
			'875785200511103026', 
			'875789889646526535', 
			'875791109169745980', 
			'875791599353880578', 
			'875793149459566612', 
			'875793305936474163', 
			'875909487331000341', 
			'875910077838688257', 
			'875910440474017824', 
			'875910617058402334', 
			'875910879680528406', 
			'875912150495924237', 
			'875912852035227699', 
			'875912893781143552', 
			'875913588299153458', 
			'875914473280532520', 
			'875914944607043584', 
			'875915168733880371', 
			'875915234911596594', 
			'875915925667332136', 
			'875916563000221707', 
			'875916798808162334', 
			'875917256729714749', 
			'875917792262647839', 
			'875918393709068359', 
			'875918652950581248', 
			'875919747173212180', 
			'875920008985854025', 
			'875920311558762547', 
			'875921485385068585', 
			'875921877678297140', 
			'875922506043772928', 
			'875922658531872778', 
			'875922743529467935', 
			'875923315015974932', 
			'875925163986812958', 
			'875925949546397726', 
			'875926742399856710', 
			'875926780559642724', 
			'875927200409468939', 
			'875927850086199327', 
			'875927908189896744', 
			'875928285811466240', 
			'875928615722836068', 
			'875928837165305887', 
			'875929226375733248', 
			'875929623005892668', 
			'875930089118900244', 
			'875930236091502614', 
			'875930492271206440', 
			'875931762306453524', 
			'875932011250999327', 
			'875932240423563385', 
			'875932273235599430', 
			'875932299542282251', 
			'875932856684253234', 
			'875933522085425182', 
			'875933657074901064', 
			'875934858080313375', 
			'875934998375596033', 
			'875935400068280410', 
			'875936270717689906', 
			'875938530042478622', 
			'875939569432948767', 
			'875939885796708362', 
			'875940032408608799', 
			'875940958611570718', 
			'875941640114675783', 
			'875942378639355935', 
			'875942494687342623', 
			'875943377085018162', 
			'875943639388413963', 
			'875944071066185839', 
			'875944512768315492', 
			'875945588875743262', 
			'875946996391899166', 
			'875948131026616400', 
			'875948431074537543', 
			'875951542207930378', 
			'875951993208864790', 
			'875952376408866817', 
			'875953178749857863', 
			'875953746864132096', 
			'875954251602472971', 
			'875956045145604117', 
			'875956704330805258', 
			'875959680713773066', 
			'875967791168127067', 
			'875968602291986494', 
			'875969805994324008', 
			'875969855659081769', 
			'875969877821767721', 
			'875971764717510676', 
			'875973343566770206', 
			'875974568269983795', 
			'875974603309195325', 
			'875974719038447616', 
			'875975959046664203', 
			'875977323676049449', 
			'875978601567240222', 
			'875979387139424297', 
			'875979657512648704', 
			'875980404539146272', 
			'875980449716011029', 
			'875983125468033034', 
			'875985757968412672', 
			'875986361235169300', 
			'875986376242364467', 
			'875987127442214912', 
			'875987786375778306', 
			'875987805908635688', 
			'875988863124901890', 
			'875989066712223784', 
			'875989804406439966', 
			'875990197735677962', 
			'875991613132902410', 
			'876148576282116187', 
			'876148969821077526', 
			'876149272926650370', 
			'876150202904510474', 
			'876150217584570420', 
			'876150449202409512', 
			'876150981233082368', 
			'876151249429471323', 
			'876151904852381798', 
			'876152015548465172', 
			'876153459089481809', 
			'876153484716691486', 
			'876153485266141245', 
			'876154036980707358', 
			'876154259450757140', 
			'876156271944937482', 
			'876158812069965875', 
			'876159606177554432', 
			'876159759693262848', 
			'876160716502106142', 
			'876160741621760041', 
			'876160842238926859', 
			'876161033721495572', 
			'876161416283967498', 
			'876161956174761994', 
			'876162185867456612', 
			'876163033293025361', 
			'876163444284473415', 
			'876163970829004870', 
			'876163987270676530', 
			'876164924550815744', 
			'876165529180708914', 
			'876165613859516467', 
			'876166934746505248', 
			'876167418291056640', 
			'876167430563561492', 
			'876167523643568128', 
			'876168215074598982', 
			'876168234339008523', 
			'876168970347085834', 
			'876169017675624518', 
			'876170270531010560', 
			'876170357625716796', 
			'876171266552381520', 
			'876171685244575764', 
			'876171818069815336', 
			'876171825506308116', 
			'876172803320205363', 
			'876173375410692196', 
			'876173423745835048', 
			'876173805939204136', 
			'876174720423297096', 
			'876176528390651985', 
			'876177082890215424', 
			'876177302189383763', 
			'876177361182273606', 
			'876177421722845234', 
			'876179095887691836', 
			'876180361439240322', 
			'876180879716810764', 
			'876181046553620480', 
			'876182498198028338', 
			'876183552549593139', 
			'876184003525365801', 
			'876184933784240179', 
			'876185565312208936', 
			'876185764906541087', 
			'876186695660359701', 
			'876186956734795797', 
			'876187768164864090', 
			'876188663887831140', 
			'876189896535048214', 
			'876190579669753917', 
			'876191549724192799', 
			'876191678300573796', 
			'876192440342708235', 
			'876193248912220221', 
			'876193449647435776', 
			'876195121924804739', 
			'876195321120710656', 
			'876195501995884626', 
			'876196020227297301', 
			'876196645228916836', 
			'876197595570143332', 
			'876197928673378345', 
			'876198355720601610', 
			'876198650919944264', 
			'876200047379881984', 
			'876203462541590589', 
			'876205713259638794', 
			'876230926995169361', 
			'876232258435039282', 
			'876237433568632913', 
			'876241558641442827', 
			'876248071875461143', 
			'876249960490885140', 
			'876253431034163281', 
			'876258661163479040', 
			'876262207535583262', 
			'876276405665660939', 
			'876314436539916299', 
			'876322304236326912', 
			'876343398565564448', 
			'876359449894322187', 
			'876362638978854932', 
			'876368624514916352', 
			'876368626544939018', 
			'876385315974168578', 
			'876390687787081760', 
			'876396108098715679', 
			'876396245483143178', 
			'876398353116704810', 
			'876404546887364609', 
			'876405206378774558', 
			'876409983103827968', 
			'876429361983660072', 
			'876429855607107645', 
			'876430746368229406', 
			'876431056541200425', 
			'876431333595959336', 
			'876431511769972797', 
			'876431768763375696', 
			'876432168874819634', 
			'876432512979705916', 
			'876432631821139999', 
			'876433296781893682', 
			'876433341711261748', 
			'876433718544322610', 
			'876434249757097994', 
			'876434470201331773', 
			'876434504049381408', 
			'876435092648624148', 
			'876435249251373067', 
			'876435427802890260', 
			'876435686729859082', 
			'876435905232138281', 
			'876436015592652821', 
			'876436399216263168', 
			'876436474843762728', 
			'876436792021225542', 
			'876437821106298900', 
			'876438195473088513', 
			'876438457394802738', 
			'876438531994685450', 
			'876438575254732860', 
			'876438891580756009', 
			'876439398965715004', 
			'876439719729311774', 
			'876440115164106792', 
			'876440536666505246', 
			'876441029799182378', 
			'876441280253689880', 
			'876442414812905473', 
			'876442455715754024', 
			'876442706375753728', 
			'876443061109010482', 
			'876443254739046450', 
			'876443407046807613', 
			'876443995667038218', 
			'876444544554663947', 
			'876444855755214848', 
			'876444935853838346', 
			'876445243665440788', 
			'876445282638897222', 
			'876445523228372992', 
			'876446088192720926', 
			'876446385879277568', 
			'876446798858825749', 
			'876447140803670057', 
			'876447410379968552', 
			'876447478843576391', 
			'876448324096503869', 
			'876448353360158730', 
			'876448837953265665', 
			'876449133353914398', 
			'876450393515786271', 
			'876450799113351228', 
			'876451137589497888', 
			'876451411238477824', 
			'876451916215902239', 
			'876452367539773460', 
			'876452459072086086', 
			'876452712630345729', 
			'876453141246279712', 
			'876453868643438672', 
			'876455563729461268', 
			'876455826108317746', 
			'876456162885791784', 
			'876456245719105566', 
			'876456375599906867', 
			'876456920490336327', 
			'876457058558427157', 
			'876457330424807514', 
			'876457399660195902', 
			'876458168295784469', 
			'876524458746200085', 
			'876524458775560193', 
			'876524458813304864', 
			'876524458855247893', 
			'876524458926571531', 
			'876524458930761740', 
			'876524458997870613', 
			'876524459002040320', 
			'876524459002040351', 
			'876524459014635560', 
			'876524459060756550', 
			'876524459094323231', 
			'876524459102699530', 
			'876524459111108689', 
			'876524459123691560', 
			'876524459132084255', 
			'876524459182411836', 
			'876524459199180863', 
			'876524459211759696', 
			'876524459228553238', 
			'876524459262115900', 
			'876524459278864384', 
			'876524459400507482', 
			'876524459446665227', 
			'876524459597656094', 
			'876524459786375238', 
			'876524459962535976', 
			'876524460105142373', 
			'876524460142895135', 
			'876524460272910346', 
			'876524460272935042', 
			'876524460381974588', 
			'876524460390383666', 
			'876524460767858729', 
			'876524460964991117', 
			'876524460964995072', 
			'876524461816414208', 
			'876524462885990460', 
			'876524471400407083', 
			'876524699105001592', 
			'876524717924823060', 
			'876524733817044993', 
			'876524736971178067', 
			'876524746752278548', 
			'876524757342904352', 
			'876524759335206972', 
			'876524759578456094', 
			'876524760736088104', 
			'876524764678721586', 
			'876524764955562014', 
			'876524767702843413', 
			'876524774904447077', 
			'876524776452128798', 
			'876524778226327684', 
			'876524779354599435', 
			'876524779539161128', 
			'876524781715988550', 
			'876524788766621746', 
			'876524797121671169', 
			'876524798476443648', 
			'876524802226143232', 
			'876524804172316782', 
			'876524804319100948', 
			'876524805300572212', 
			'876524805887758406', 
			'876524815073308742', 
			'876524824019759125', 
			'876524825764560906', 
			'876524826582478908', 
			'876524827048022077', 
			'876524832097959966', 
			'876524844479578172', 
			'876524849877647390', 
			'876524857947480064', 
			'876524861504253983', 
			'876524870563930183', 
			'876524938436149280', 
			'876524997978488863', 
			'876525019776299028', 
			'876525038998798346', 
			'876525039959302204', 
			'876525046871490592', 
			'876525056820391946', 
			'876525059752218644', 
			'876525060268097558', 
			'876525067851399198', 
			'876525069776605185', 
			'876525073819926528', 
			'876525080568557609', 
			'876525082854424669', 
			'876525082883813446', 
			'876525086788698123', 
			'876525091574407228', 
			'876525097115070514', 
			'876525102655758357', 
			'876525103746261042', 
			'876525110260035645', 
			'876525112495599616', 
			'876525127137898496', 
			'876525135794937856', 
			'876525137732698162', 
			'876525146196811887', 
			'876525146293293066', 
			'876525150219165738', 
			'876525152194662451', 
			'876525167763922996', 
			'876525189515591750', 
			'876525190090219550', 
			'876525204162097162', 
			'876525204292132894', 
			'876525206116659260', 
			'876525213003685909', 
			'876525220817698828', 
			'876525228258381876', 
			'876525243928313887', 
			'876525256523796481', 
			'876525271283535952', 
			'876525273816916000', 
			'876525287268032532', 
			'876525296155779072', 
			'876525306297585675', 
			'876525309283938334', 
			'876525309690798152', 
			'876525310852616213', 
			'876525310898765844', 
			'876525331912204419', 
			'876525332293881886', 
			'876525333338267668', 
			'876525338342076508', 
			'876525339701043251', 
			'876525347166883850', 
			'876525354280423504', 
			'876525362249613332', 
			'876525377131020288', 
			'876525383128842321', 
			'876525408961564732', 
			'876525441719099442', 
			'876525447956029490', 
			'876525466289336340', 
			'876525467694399488', 
			'876525474602442774', 
			'876525476661829643', 
			'876525479761424486', 
			'876525480038244352', 
			'876525485683781673', 
			'876525496874205304', 
			'876525499092983808', 
			'876525504629473280', 
			'876525508647587860', 
			'876525512808333363', 
			'876525517052985404', 
			'876525521805131807', 
			'876525525944909884', 
			'876525531850489916', 
			'876525541795168318', 
			'876525554977882143', 
			'876525562649260093', 
			'876525566285725726', 
			'876525573164367953', 
			'876525574682710097', 
			'876525611508723732', 
			'876525625756749905', 
			'876525626369118269', 
			'876525628525002782', 
			'876525654030553098', 
			'876525702114078801', 
			'876525706824286289', 
			'876525708342620160', 
			'876525712767594508', 
			'876525727103729674', 
			'876525728286511124', 
			'876525728601100368', 
			'876525752194048010', 
			'876525757260775434', 
			'876525770372177950', 
			'876525780912447519', 
			'876525784729268244', 
			'876525801913335828', 
			'876525807030390825', 
			'876525807168782346', 
			'876525809769275434', 
			'876525811224707153', 
			'876525813758058517', 
			'876525814521409636', 
			'876525818396962816', 
			'876525821186174986', 
			'876525822012448848', 
			'876525824579371018', 
			'876525831499960392', 
			'876525833395785728', 
			'876525835232886875', 
			'876525837543948289', 
			'876525865176019015', 
			'876525867763900537', 
			'876525876332867604', 
			'876525884885049425', 
			'876525887959478272', 
			'876525889523941457', 
			'876525890044047390', 
			'876525890111152128', 
			'876525899208618044', 
			'876525904992534581', 
			'876525908985520208', 
			'876525910424174622', 
			'876525916883410995', 
			'876525921790734336', 
			'876525937250926622', 
			'876525947241767002', 
			'876525964841078834', 
			'876525989319024650', 
			'876526021195739166', 
			'876526036588822538', 
			'876526038576930838', 
			'876526074589229086', 
			'876526120562983032', 
			'876526156139094016', 
			'876526156252332052', 
			'876526156654981170', 
			'876526157732913222', 
			'876526158030708746', 
			'876526158139781161', 
			'876526158265581628', 
			'876526159184146563', 
			'876526160220143687', 
			'876526161386160208', 
			'876526162510245888', 
			'876526163281969184', 
			'876526163940503592', 
			'876526171188232192', 
			'876526180931624981', 
			'876526181976002580', 
			'876526184882638858', 
			'876526186883321878', 
			'876526195636830249', 
			'876526198539300915', 
			'876526201303343124', 
			'876526207829704775', 
			'876526221066903593', 
			'876526231791751168', 
			'876526255594405918', 
			'876526269947318273', 
			'876526277580963910', 
			'876526289920598047', 
			'876526294999916554', 
			'876526311038939176', 
			'876526315535229006', 
			'876526321231093930', 
			'876526331364519998', 
			'876526389958963231', 
			'876526397504520192', 
			'876526397873586298', 
			'876526398448226345', 
			'876526423899275275', 
			'876526428710117426', 
			'876526432338182214', 
			'876526437950189619', 
			'876526439887949884', 
			'876526442375151696', 
			'876526442626814013', 
			'876526446410100766', 
			'876526447290904586', 
			'876526447739699261', 
			'876526453871738901', 
			'876526458087018497', 
			'876526459550846997', 
			'876526463254396929', 
			'876526471848534097', 
			'876526477171130369', 
			'876526485584896020', 
			'876526485937225829', 
			'876526486658642051', 
			'876526505977577482', 
			'876526509211398154', 
			'876526510687793162', 
			'876526511761535066', 
			'876526511878991922', 
			'876526529046265908', 
			'876526545005604914', 
			'876526551661940777', 
			'876526552714707034', 
			'876526554111410256', 
			'876526567780663346', 
			'876526569571622953', 
			'876526574252486656', 
			'876526583035338875', 
			'876526593273655316', 
			'876526603268673587', 
			'876526611875364884', 
			'876526618632421387', 
			'876526622977691730', 
			'876526642296672286', 
			'876526649628299305', 
			'876526655512911913', 
			'876526661187797082', 
			'876526679386906644', 
			'876526693710446602', 
			'876526696055050250', 
			'876526708898004992', 
			'876526709090943016', 
			'876526710756085831', 
			'876526721392857099', 
			'876526723892670575', 
			'876526735926104064', 
			'876526737922617394', 
			'876526741429051453', 
			'876526742137872384', 
			'876526746307010610', 
			'876526771309264966', 
			'876526778695434260', 
			'876526789374148658', 
			'876526816725196911', 
			'876526819141103646', 
			'876526820323897454', 
			'876526823016628274', 
			'876526830780305428', 
			'876526831371702282', 
			'876526854100619304', 
			'876526855329550468', 
			'876526858940846142', 
			'876526869921546250', 
			'876526875898425354', 
			'876526879694282834', 
			'876526896257581117', 
			'876526899340386347', 
			'876526907401830431', 
			'876526918541934633', 
			'876526934526410773', 
			'876526945330933790', 
			'876526948766056488', 
			'876526962582114364', 
			'876526963991396473', 
			'876526969133629521', 
			'876526971172032552', 
			'876526982228213821', 
			'876526997147385876', 
			'876527002927112193', 
			'876527003707244644', 
			'876527004302856223', 
			'876527005993164900', 
			'876527008459411497', 
			'876527022095106108', 
			'876527034531209267', 
			'876527037119070289', 
			'876527038423519303', 
			'876527039040069642', 
			'876527045117612083', 
			'876527048171065424', 
			'876527050289193100', 
			'876527053799841832', 
			'876527056173822002', 
			'876527058744926280', 
			'876527060191944774', 
			'876527062423306300', 
			'876527064394653716', 
			'876527075492782121', 
			'876527081775853598', 
			'876527096753692732', 
			'876527118018830407', 
			'876527126914945084', 
			'876527132501770242', 
			'876527140521250867', 
			'876527140789698602', 
			'876527144635863050', 
			'876527145642496001', 
			'876527153691369492', 
			'876527154106613761', 
			'876527154295349298', 
			'876527154895130635', 
			'876527165536088144', 
			'876527171626213477', 
			'876527175224946710', 
			'876527179465359393', 
			'876527182606917753', 
			'876527195781234720', 
			'876527200785039390', 
			'876527203133833227', 
			'876527205537161299', 
			'876527220225605684', 
			'876527223123882024', 
			'876527246557450241', 
			'876527249992581210', 
			'876527255571021834', 
			'876527258125369364', 
			'876527260591587398', 
			'876527261547900949', 
			'876527261971546222', 
			'876527267822600203', 
			'876527272499236934', 
			'876527272541171712', 
			'876527285698715678', 
			'876527287070240798', 
			'876527299250503700', 
			'876527307039318016', 
			'876527315021078538', 
			'876527319546749000', 
			'876527321409011742', 
			'876527323137060874', 
			'876527326219866142', 
			'876527327000035408', 
			'876527331932508241', 
			'876527332226130101', 
			'876527339507433482', 
			'876527356938952724', 
			'876527360172777544', 
			'876527362290909285', 
			'876527371946176542', 
			'876527375519735919', 
			'876527384730415174', 
			'876527396189261884', 
			'876527397237825636', 
			'876527412765155372', 
			'876527418624581642', 
			'876527420268748850', 
			'876527425138352179', 
			'876527427172593715', 
			'876527427881435168', 
			'876527428246306877', 
			'876527428468633610', 
			'876527436492320768', 
			'876527438698537013', 
			'876527440938283098', 
			'876527470516502568', 
			'876527473343471686', 
			'876527483015553146', 
			'876527488774336543', 
			'876527506004520970', 
			'876527511595540531', 
			'876527516888727592', 
			'876527530398613514', 
			'876527541890973748', 
			'876527548987764778', 
			'876527552695525457', 
			'876527552758415420', 
			'876527552968134678', 
			'876527556612997172', 
			'876527557766438954', 
			'876527572589084693', 
			'876527576317853737', 
			'876527581543956541', 
			'876527582718353458', 
			'876527583372640298', 
			'876527589274042438', 
			'876527594370125835', 
			'876527595842334761', 
			'876527605107539979', 
			'876527610232967209', 
			'876527628574654574', 
			'876527637219143681', 
			'876527675781574706', 
			'876527679149588531', 
			'876527680726634506', 
			'876527684514111528', 
			'876527697952665600', 
			'876527713073115166', 
			'876527720002101258', 
			'876527724385169521', 
			'876527730169110608', 
			'876527736464736326', 
			'876527749408374796', 
			'876527750410797077', 
			'876527758002487348', 
			'876527763010502720', 
			'876527767414509639', 
			'876527791066198077', 
			'876527797399613521', 
			'876527804630593547', 
			'876527811207258162', 
			'876527812444581908', 
			'876527831360868392', 
			'876527847827734568', 
			'876527853984956417', 
			'876527860322558002', 
			'876527864009330800', 
			'876527865921941536', 
			'876527879675076648', 
			'876527884884406312', 
			'876527886658572358', 
			'876527902718558229', 
			'876527912927522846', 
			'876527914055770143', 
			'876527918757589102', 
			'876527928840716340', 
			'876527930942046248', 
			'876527944355422278', 
			'876527971714875442', 
			'876527972734103562', 
			'876527984427794504', 
			'876528021165723658', 
			'876528021421584445', 
			'876528038563696701', 
			'876528061301031003', 
			'876528078485082124', 
			'876528083849596938', 
			'876528089830682674', 
			'876528099293016084', 
			'876528103747371109', 
			'876528105995534417', 
			'876528106440126474', 
			'876528133254287411', 
			'876528138467815465', 
			'876528140527210617', 
			'876528153777025034', 
			'876528167261708330', 
			'876528167991541811', 
			'876528202741329941', 
			'876528203265626133', 
			'876528209615798272', 
			'876528214682505267', 
			'876528214850277397', 
			'876528219682132019', 
			'876528220160294914', 
			'876528268759674901', 
			'876528272463245342', 
			'870673637026439208', 
			'872322937577934888', 
			'873821911493246986', 
			'874233332353863730', 
			'872596885154721862', 
			'872887204966436904', 
			'874209762286383165', 
			'874214509814874162', 
			'874395627516215316', 
			'874402379418718249', 
			'874411038261526569', 
			'874419303099797544', 
			'874424217892974642', 
			'874425570644095027', 
			'875590889140015154', 
			'870968572149628928', 
			'873279055070388264', 
			'874711488164675594'];
		let content = '';
		users.forEach(async (u, i) => {
			const user = msg.client.users.cache.get(u);
			if (user.flags == null || user.flags.bitfield == 0) {
				content += `${user.id} - ${user.username}\n`;
			}
		});
		console.log(1, content);

	}
};