// 该示例部署地址：  https://ropsten.etherscan.io/address/0x698f784668cab1338a7f03dbfda5596ec65e9ca3

App = {
	web3Provider: null,
	contracts: {},

	init: function () {
		return App.initWeb3();
	},

	// 初始化web3s实例 后 实例化合约 并 获取合约 渲染数据 交互合约 渲染数据 监听合约事件 添加事件绑定。
	initWeb3: async function () {
		if (window.ethereum) {
			this.provider = window.ethereum;
			try {
				await window.ethereum.enable();
			} catch (error) {
				console.error("User denied account access");
			}
		} else if (typeof web3 !== "undefined") {
			App.web3Provider = web3.currentProvider;
			web3 = new Web3(App.web3Provider);
		} else {
			App.web3Provider = new Web3.providers.HttpProvider("http://localhost:9545");
			web3 = new Web3(App.web3Provider);
		}

		return App.initContract(); //实例化合约 并 获取合约 渲染数据 交互合约 渲染数据 监听合约事件 添加事件绑定。
	},



	// 总体功能集成:  实例化合约 并 获取合约 渲染数据 交互合约 渲染数据 监听合约事件 添加事件绑定。
	// 初始化合约实例 并 获取合约渲染主页数据、监听合约事件获取信息渲染数据、添加绑定事件处理：更改链上数据 后 获取数据并渲染主页。
	initContract: function () {
		// ??? InfoContract.json 文件在哪里 ???
		// 根据获取到的json文件来构建合约 并 设置provider；
		$.getJSON("InfoContract.json", function (data) {
			App.contracts.InfoContract = TruffleContract(data);
			App.contracts.InfoContract.setProvider(App.web3Provider);

			App.getInfo(); // getInfo() 获取合约信息，后根据合约链上数据 更改渲染主页数据。
			App.watchChanged(); // watchChanged() 监听合约事件: 获取合约链上信息、隐藏loading...、根据链上信息更新选人web页面信息。
		});

		App.bindEvents(); // bindEvents() 绑定事件 给提交按钮 来更改合约链上数据、获取链上数据、更新渲染主页数据。
	},



	// getInfo() 获取合约信息，后根据合约链上数据 更改渲染主页数据。
	getInfo: function () {
		App.contracts.InfoContract.deployed()
			.then(function (instance) {
				return instance.getInfo.call(); //获取合约链上信息
			})
			.then(function (result) {
				$("#loader").hide(); //隐藏loading...
				$("#info").html(result[0] + " (" + result[1] + " years old)"); //根据链上信息 渲染页面数据。
				console.log(result);
			})
			.catch(function (err) {
				console.error(err);
			});
	},

	// bindEvents() 绑定事件 给提交按钮 来更改合约链上数据、获取链上数据、更新渲染主页数据。
	bindEvents: function () {
		$("#button").click(function () {
			//点击提交后，显示 loading 信息...
			$("#loader").show();

			//根据提交按钮信息，交互链上合约更改信息。 后链式调用 // getInfo() 获取合约信息，后根据合约链上数据 更改渲染主页数据。
			App.contracts.InfoContract.deployed()
				.then(function (instance) {
					return instance.setInfo($("#name").val(), $("#age").val(), { gas: 500000 });
				})
				// getInfo() 获取合约信息，后根据合约链上数据 更改渲染主页数据。
				.then(function (result) {
					return App.getInfo();
				})
				.catch(function (err) {
					console.error(err);
				});
		});
	},

	// watchChanged() 监听合约事件: 获取合约链上信息、隐藏loading...、根据链上信息更新选人web页面信息。
	watchChanged: function () {
		App.contracts.InfoContract.deployed().then(function (instance) {
			var infoEvent = instance.Instructor();
			return infoEvent.watch(function (err, result) {
				$("#loader").hide();
				$("#info").html(result.args.name + " (" + result.args.age + " years old)");
			});
		});
	},
};

$(function () {
	$(window).load(function () {
		App.init();
	});
});
