function bootstable(options, domId)
{
	
	if(!options) options = {};
	var htmlString = '';
	var htmlHeadString = '';
	var htmlBodyString = '';
	var htmlFooterString = '';
	var fields = '';
	var pagingString = '';
	var loadingContent = '';
	var jsonData = [];
	var domObject;
	var totalCount = 0;
	var countPage = 0;
	var currentPage = 1;
	var showLoadIng = false;
	var paging = true;
	var nextPage, prevpage, rand;
	var otherData = {};
	var async = false;
	var defaultShowPageNumber = 6;
	var step = 2;
	var pagingStyle = 'base';
	var _self = this;
	this.init = function() {
		this.paging = true;
		for (var p in options) {
			if (options[p] == undefined) {
				continue;
			}

			this[p] = options[p];
		}
		if (this.htmlHeadString == undefined) {
			this.htmlHeadString = '';
		}

		if (this.htmlBodyString == undefined) {
			this.htmlBodyString = '';
		}

		if (this.htmlFooterString == undefined) {
			this.htmlFooterString = '';
		}

		if (this.pagingString == undefined) {
			this.pagingString = '';
		}	

		if (this.loadingContent == undefined) {
			this.loadingContent = '';
		}	

		if (this.fields == undefined) {
			this.fields = '';
		}	

		if (this.async == undefined) {
			this.async = false;
		}	

		if (this.defaultShowPageNumber == undefined) {
			this.defaultShowPageNumber = 6;
		}

		if (this.step == undefined) {
			this.step = 2;
		}

		if (this.pagingStyle == undefined) {
			this.pagingStyle = 'base';
		}

		if (this.otherData == undefined) {
			this.otherData = {};
		}

		this.currentPage = 1;
		this.rand = this.getRand();
		// this.__create();
		this.loadData(this.otherData);
	}
	
	this.loadData = function(options) {
		console.log('传递的参数有:', options);
		// this.otherData = {};
		for (var p in options) {
			if(options[p] != '' || options[p] != null || options[p] != undefined) {
				this.otherData[p] = options[p];
			}
			
		}
		this.currentPage = 1;
		this.__create();
	}

	this.__create = function () {
		this.domObject = document.getElementById(domId);
		if(this.htmlHeadString) {
			this.htmlHeadString = '';
		}
		if(this.htmlBodyString) {
			this.htmlBodyString = '';
		}
		if(this.htmlFooterString) {
			this.htmlFooterString = '';
		}
		if(this.pagingString) {
			this.pagingString = '';
		}	

		if(this.fields) {
			this.fields = '';
		}	
		if (this.viewType == 'table') {
			this.htmlString = '<table class="table table-hover" id="mainbody_' + this.rand + '"><thead>';
			this.htmlHeadString += '<tr>';
			for(var p in this.columns) {
				var th = this.columns[p].text;
				this.htmlHeadString += '<th>' + th + '</th>';
			}
			this.htmlHeadString += '</tr></thead>';
			this.htmlFooterString = '</table>';

		} else if (this.viewType == 'ul') {
			this.htmlString = '<ul class="post-list" id="mainbody_' + this.rand + '">';
			this.htmlFooterString = '</ul>';
		} else if (this.viewType == 'div') {
			this.htmlString = '<div class="media" id="mainbody_' + this.rand + '">';
			this.htmlFooterString = '</div>';
		}
		
		for(var p in this.columns) {
			var field = this.columns[p].dataIndex;
			this.fields += field + ',';
		}
		
		var requestData = {
			fields: this.fields.substr(0, this.fields.length-1), 
			pageSize: this.pageSize,
			page: this.currentPage,
			table: this.table,
			searchParams: {},
		};

		if(this.otherData) {
			requestData.searchParams = this.otherData;
			console.log('搜索请求的参数有：', requestData);	
			// return;
		}

		this.htmlString += this.htmlHeadString + this.htmlBodyString + this.htmlFooterString;
		this.htmlString += '<div id="paging_'+ this.rand +'"></div><div id="ajax_loading_' + this.rand + '"  class="text-center fullscreen" style="position: absolute;z-index: 999;background: #000;text-align: center;opacity: 0.5;top: 0;left: 0;left: 50%;margin-left: -50%;"></div>';
		$(this.domObject).html(this.htmlString);
		this._request('POST', requestData, 'json');
		$(this.domObject).css('position', 'relative');
	}

	this.__createBody = function(rows) {
		console.log('接口返回的记录集：', rows, this.viewType);
		// $("#mainbody_" + this.rand).remove();
		for (var key in rows) {
			if (this.viewType == 'table') { 
				this.htmlBodyString += '<tr>';
				for (var p in this.columns) {
					var field = this.columns[p].dataIndex;
					this.htmlBodyString += '<td>' + rows[key][field] + '</td>';
				}
				this.htmlBodyString += '</tr>';
			} else if (this.viewType == 'ul') {
				this.htmlBodyString += '<li>';
				for (var p in this.columns) {
					var field = this.columns[p].dataIndex;
					if (field.indexOf('created_at') > -1) {
						this.htmlBodyString += '<div class="pull-right">' + rows[key][field] + '</div>';
					} else {
						this.htmlBodyString += '<a>' + rows[key][field] + '</a>';
					}
				}
				this.htmlBodyString += '</li>';
			} else if(this.viewType == 'div') {
				this.htmlBodyString += '<div class="media">';
				this.htmlBodyString += '<div class="media-left"><img class="media-object" src='+ rows[key]['cover'] + '></div>';
				this.htmlBodyString += '<div class="media-body"><h4 class="media-heading" style="color: green;"><b>' + rows[key]['title'] + '</b></h4><div class="media-content" style="text-indent: 2em; height: 80px; overflow: hidden;">' + rows[key]['content'] + '</div></div>';
				this.htmlBodyString += '</div>';
			}
		}
		// console.log(this.htmlBodyString);this.async && 
		$("#mainbody_" + this.rand).html(this.htmlBodyString);
		this.paging && this._paging();
		this.showLoadIng  && this._createLoading();
	}

	this._paging = function () {
		var firstpaging = '';
		var lastpaging = '';
		this.prevpage = this.currentPage == 1 ? 1 : this.currentPage - 1;
		this.nextpage = this.currentPage == this.countPage ? this.countPage : parseInt(this.currentPage) + 1;
		if(this.pagingStyle == 'base') {
			if (this.currentPage == 1) {
				firstpaging = '<li class="first disabled"><span>首页</span></li><li class="prev disabled"><span>上一页</span></li>';
			} else {
				firstpaging = '<li class="first first_paging_'+ this.rand +'"><a href="javascript:;" data-page="1">首页</a></li><li  class="prev prev_paging_'+ this.rand +'"class="prev prev_paging_'+ this.rand +'"><a href="javascript:;" data-page="' + this.prevpage + '">上一页</a></li>';
			}

			if (this.currentPage == this.countPage) {
				lastpaging = '<li class="next disabled"><span>下一页</span></li><li class="last disabled"><span>尾页</span></li>';
			} else {
				lastpaging = '<li class="next next_paging_'+ this.rand +'"><a href="javascript:;" data-page="' + this.nextpage + '">下一页</a></li><li class="last last_paging_'+ this.rand +'" ><a href="javascript:;" data-page="' + this.countPage + '">尾页</a></li>';
			}

			for (var i = 1; i <= this.countPage; i++) {
				var active = this.currentPage == i ? 'active' : '';
				this.pagingString += '<li class="paging_yema_' + this.rand + ' ' + active + '"><a href="javascript:;" data-page="' + i + '">' + i + '</a></li>';
			}
		} else {
			var i = 1;
			var defaultShowPageNumber = this.defaultShowPageNumber;
			var step = this.step;
			if(this.currentPage > 1) {
				firstpaging = '<li class="prev prev_paging_'+ this.rand +'"><a href="javascript:;" data-page="' + this.prevpage + '">上一页</a></li>';
			}

			if(this.currentPage + step > defaultShowPageNumber) {
				var factive = this.currentPage == 1 ? 'active' : '';
				firstpaging = '<li class="prev prev_paging_'+ this.rand +'"><a href="javascript:;" data-page="' + this.prevpage + '">上一页</a></li><li class="paging_yema_' + this.rand + ' ' + factive + '"><a href="javascript:;" data-page="1">1</a></li><li><span>...</span></li>';
				if((this.countPage - this.currentPage) < step) {
					step = this.countPage - this.currentPage;
					i = this.currentPage - this.defaultShowPageNumber + this.step;
					console.log('step is:%d', step);
				} else {
					i = this.currentPage - step;

				}

				defaultShowPageNumber = this.currentPage + step;
			} 

			for(i; i <= defaultShowPageNumber; i++) {
				var active = this.currentPage == i ? 'active' : '';
				this.pagingString += '<li class="paging_yema_' + this.rand + ' ' + active + '"><a href="javascript:;" data-page="' + i + '">' + i + '</a></li>';			
			}
			// defaultShowPageNumber < this.countPage && 
			if(this.currentPage < this.countPage) {
				lastpaging = '<li><span>...</span></li><li class="next next_paging_'+ this.rand +'"><a href="javascript:;" data-page="' + this.nextpage + '">下一页</a></li>';
			}
		}

		$('#' + domId + ' #paging_' + this.rand + '').html('<ul class="pagination pull-right">' + firstpaging + this.pagingString + lastpaging + '</ul>');

		$('.paging_yema_' + this.rand).bind('click', function(event) {
			var page = $(this).children('a').data('page') ? $(this).children('a').data('page') : $(this).children('a').attr('data-page');
			_self.currentPage = page;
			_self.showLoadIng = true;
			_self.__create();
		});

		$(".first_paging_" + this.rand).bind('click', function(event) {
			var page = $(this).children('a').data('page') ? $(this).children('a').data('page') : $(this).children('a').attr('data-page');
			_self.currentPage = page;
			_self.showLoadIng = true;
			_self.__create();
		});	

		$(".prev_paging_" + this.rand).bind('click', function(event) {
			var page = $(this).children('a').data('page') ? $(this).children('a').data('page') : $(this).children('a').attr('data-page');
			_self.currentPage = page;
			_self.showLoadIng = true;
			_self.__create();
		});		

		$(".next_paging_" + this.rand).bind('click', function(event) {
			var page = $(this).children('a').data('page') ? $(this).children('a').data('page') : $(this).children('a').attr('data-page');
			_self.currentPage = page;
			_self.showLoadIng = true;
			_self.__create();
		});

		$(".last_paging_" + this.rand).bind('click', function(event) {
			var page = $(this).children('a').data('page') ? $(this).children('a').data('page') : $(this).children('a').attr('data-page');
			_self.currentPage = page;
			_self.showLoadIng = true;
			_self.__create();
		});
	}

	this._createLoading = function() {
			
		$("#ajax_loading_" + this.rand).html(this.loadingContent);
		if (this.loadingContent) {
			var height = $(this.domObject).height() ? $(this.domObject).height() : 300;
			$("#ajax_loading_" + this.rand).width($(this.domObject).width() + 20);
			if(this.async) {
				$("#ajax_loading_" + this.rand).height(height);
				$(".data_loading_" + this.rand).children('img').height(height);				
			}

		}

	}

	this._request = function(type, data, dataType) {
		this.jsonData = data;
		dataType = dataType || 'html';
		jQuery.ajax({
			type: type,
			async: _self.async,
			data: data,
			url: this.url,
			dataType: dataType,
			timeout: 10000,
			success: function(da) {
				// {"totalCount":"3","rows":[{"id":"1","name":"\u5c0f\u5b66","xyears":"6","addtime":"2017-01-15"}]}
				_self.totalCount = da.totalCount;
				_self.countPage = Math.ceil(_self.totalCount/_self.pageSize);
				// _self.currentPage = da.currentPage;
				console.log('countPage', _self.countPage, _self.currentPage);
				if (da.totalCount > 0) {
					_self.__createBody(da.rows);
				}
			},
            beforeSend: function() {
            	_self.loadingContent = '<div class="data_loading_' + _self.rand + '"><img src="static/images/data-loading.gif" style="max-width:100%;line-height:100px"  height="100"/></div>';    
            	_self._createLoading();
            },   
            complete: function(XMLHttpRequest, textStatus) {  
            	// _self.loadingContent = '';
            	console.log('XMLHttpRequest.status', XMLHttpRequest.status);
            	console.log('XMLHttpRequest.readyState', XMLHttpRequest.readyState);
            	console.log('textStatus', textStatus);
            	setTimeout(function() {
            		if(XMLHttpRequest.status == 200) {
            			$("#ajax_loading_" + _self.rand).fadeOut(); 
            		} else {
            			$(_self.domObject).children(" #ajax_loading_" + _self.rand).html('请求失败');
            		}
            		
            	}, 200)
            },
            error: function(XMLHttpRequest, textStatus, errorThrown) {
                // alert(XMLHttpRequest.status);
                // alert(XMLHttpRequest.readyState);
                // alert(textStatus);            	
            } 
		})
	}

	this.getRand = function() {
		var r;
		r = ''+new Date().getTime()+'';
		r+='_'+parseInt(Math.random()*9999)+'';
		return r;
	}

}

window.utils_html = function(options, domId) {
	var boot_utils = new bootstable(options, domId);
	boot_utils.init();
	
	return boot_utils;
}