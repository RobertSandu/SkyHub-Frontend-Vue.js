/**
 * Created by Alexandru Ionut Budisteanu - SkyHub on 6/29/2017.
 * (C) BIT TECHNOLOGIES
 */


<template>

        <div class="panel panel-success">

            <div class="panel-heading">
                <h3 style='margin: 0'><strong>Reply</strong> to {{this.parentReplyTitle||this.parentTitle||'Home'}} </h3>

            </div>


            <div class="panel-body">

                <form @submit="this.handleAddReply" autoComplete="on">


                    <div style="padding-bottom: 10px" >
                        <div :class="'input-group ' + this.showInputStatus(this.titleValidationStatus)"  >

                            <span class="input-group-addon"><i class="fa fa-pencil"></i></span>

                            <input  type='text' class='form-control input' placeholder='title'  name="title" :value="this.title" @keydown="this.handleTitleChange" @change="this.handleTitleChange" style='z-index : 0' />

                            <span :class="this.showInputFeedback(this.titleValidationStatus)" style='width:60px; top:10px'></span>
                        </div>
                        <label class="error" >{{this.titleValidationStatus[1]}}</label> <br />
                    </div>


                    <div class="ibox float-e-margins border-bottom " style="margin-bottom: 20px">
                        <div class="ibox-title">
                            <h5 style="padding-right: 20px"><i class="fa fa-picture-o" style="padding-right: 5px"></i> <i class="fa fa-link" style="padding-right: 5px"></i>Link images<small> attachments </small></h5>

                            <div class="ibox-tools" style="text-align: left; " onClick="collapseIBOX(this, this)">
                                <i class="fa fa-chevron-down" ></i>
                            </div>
                        </div>
                        <div class="ibox-content" style="display: none;">
                            <div class="row">

                                    <strong>Link:</strong>
                                    <div :class="'input-group ' + this.showInputStatus(this.linkValidationStatus)"  >

                                        <span class="input-group-addon"><i class="fa fa-link"></i></span>

                                        <input  type='text' class='form-control input' placeholder='title'  name="title" :value="this.link" @change="this.handleLinkChange" style='z-index : 0' />

                                        <span :class="this.showInputFeedback(this.linkValidationStatus)" style="width:60px; top:10px"></span>
                                    </div>
                                    <label class="error" >{{this.linkValidationStatus[1]}}</label> <br />

                                    <no-ssr>
                                        <FileUploadDropzone :idProp="this.parentId+'_'+this.parentReplyId" @onSuccessNewAttachment="this.fileUploadSuccess" @onRemoveAttachment="this.fileUploadRemoved" />
                                    </no-ssr>

                            </div>
                        </div>
                    </div>



                    <no-ssr>
                        <!-- <MyVueEditor ref="refDescriptionEditor" @onChange = "handleDescriptionChange"/> -->
                        <MyQuillEditor ref="refDescriptionEditor" @onChange = "handleDescriptionChange"/>
                    </no-ssr>

                    <span :class="this.showInputFeedback(this.descriptionValidationStatus)"></span>
                    <label class="error" >{{this.descriptionValidationStatus[1]}}</label> <br />


                    <strong>Preview</strong>
                    <PreviewNewReply :title="this.title" :description="this.description" :attachments="this.attachments" :authorId="this.$store.state.authenticatedUser.user.id||''" ref="refPreviewNewReply" />

                    <div v-if="this.error !== ''">
                        <div class="alert alert-danger alert-dismissable">
                            <div v-html="this.error" />
                        </div>
                    </div>

                </form>

            </div>

            <div class="panel-footer text-right" style='padding-top:20px; padding-bottom:20px; padding-right:20px'>

                <LoadingButton class="btn-success" @onClick="this.handleAddReply" text="submit Reply" icon="fa fa-plus"  ref="refSubmitButton"  />

            </div>

        </div>

</template>


<script>

    import {showInputStatus, showInputFeedback, convertValidationErrorToString} from 'client/components/util-components/form-validation/formValidation';
    import LoadingButton from 'client/components/util-components/UI/buttons/LoadingButton.vue';

    import NoSSR from 'vue-no-ssr'

    import FileUploadDropzone from 'client/components/util-components/file-upload/dropzone/FileUploadDropzone.component.vue';
    import MyQuillEditor from 'client/components/util-components/text-editor/MyQuillEditor.component.vue';
    import PreviewNewReply from 'modules/forums/replies/components/PreviewNewReply.vue';

    import Reply from 'models/Reply/Reply.model';
    import Attachments from 'models/Attachment/Attachments.model'

    export default{
        name: "AddReply",

        components: {
            'no-ssr': NoSSR,
            "LoadingButton": LoadingButton,

            "PreviewNewReply" : PreviewNewReply,
            "FileUploadDropzone": FileUploadDropzone,
            'MyQuillEditor': MyQuillEditor,
        },

        data: function (){
            return {
                title: '',
                link: '',
                description: '',

                attachments: [],

                countryCode: '', country: '',
                city: '',
                language: '',
                latitude: 0, longitude: 0,

                titleValidationStatus: [null, ''],
                linkValidationStatus: [null, ''],
                descriptionValidationStatus: [null, ''],

                error: '',

                parentValidationStatus: [null, ''],
            }
        },

        props:{
            parentId: {default:''},
            parentTitle: {default:''},

            parentReplyId : {default: ''},
            parentReplyTitle : {default: ''},
        },

        //@onSuccess;
        //@onError;

        computed:{

            localization(){
                return this.$store.state.localization;
            },

            getTitle(){
                return Attachments.getTitle(this.$refs['refPreviewNewReply'].reply);
            },

            getImage(){
                return Attachments.getImage(this.$refs['refPreviewNewReply'].reply);
            },

            getKeywords(){
                return Attachments.getKeywords(this.$refs['refPreviewNewReply'].reply);
            },

            getDescription(){
                return Attachments.getDescription(this.$refs['refPreviewNewReply'].reply);
            },

        },


        methods:{

            showInputStatus(status) {return showInputStatus(status)},
            showInputFeedback(status) {return showInputFeedback(status)},
            convertValidationErrorToString(error) {return convertValidationErrorToString(error)},

            async handleAddReply(e){

                if ((typeof e !== "undefined")&&(e !== null)) {
                    e.preventDefault();
                    e.stopPropagation();
                }

                if (this.$refs['refSubmitButton'].disabled === true) // avoid multiple post requests
                    return false;

                let bValidationError=false;
                this.error = ''; this.titleValidationStatus = [null, '']; this.linkValidationStatus = [null,'']; this.descriptionValidationStatus = [null,'']; this.keywordsValidationStatus = [null,'']; this.countryValidationStatus = [null,'']; this.cityValidationStatus = [null,''];

                if (!bValidationError)
                    try {
                        let answer = await this.$store.dispatch('CONTENT_REPLIES_SUBMIT_ADD',{parent:this.parentId, parentReply: this.parentReplyId, title: this.getTitle, description: this.getDescription, attachments: this.attachments, keywords: this.getKeywords,
                                                                                             countryCode: this.countryCode||this.localization.countryCode, language:'',
                                                                                             city: this.city||this.localization.city, latitude:this.latitude||this.localization.latitude, longitude:this.longtitude||this.localization.longitude});

                        this.$refs['refSubmitButton'].enableButton();

                        console.log("ANSWER FROM adding reply ",answer);

                        if (answer.result === true) {
                            this.$emit('onSuccess',answer);
                        }
                        else
                        if (answer.result === false) {

                            console.log("ERROR publishing a new reply", answer);

                            if ((typeof answer.errors.title !== "undefined") && (Object.keys(answer.errors.title).length !== 0 )) this.titleValidationStatus = ["error", this.convertValidationErrorToString(answer.errors.title[0])];
                            if ((typeof answer.errors.link !== "undefined") && (Object.keys(answer.errors.link).length !== 0 )) this.linkValidationStatus = ["error", this.convertValidationErrorToString(answer.errors.link[0])];
                            if ((typeof answer.errors.description !== "undefined") && (Object.keys(answer.errors.description).length !== 0)) this.descriptionValidationStatus = ["error", this.convertValidationErrorToString(answer.errors.description[0])];
                            if ((typeof answer.errors.keywords !== "undefined") && (Object.keys(answer.errors.keywords).length !== 0)) this.keywordsValidationStatus = ["error", this.convertValidationErrorToString(answer.errors.keywords[0])];


                            //in case there are no other errors, except the fact that I am not logged In
                            if ((typeof answer.errors.authorId !== "undefined") && (Object.keys(answer.errors.authorId).length !== 0))
                                if ((this.titleValidationStatus[0] === null)&&(this.descriptionValidationStatus[0] === null)&&(this.keywordsValidationStatus[0] === null)&&(this.countryValidationStatus[0] === null)&&(this.cityValidationStatus[0] === null))
                                    this.openLogin();

                            this.$emit('onError',answer);
                        }
                    }
                    catch(Exception){
                        this.$refs['refSubmitButton'].enableButton();
                        this.error = "There was a internal problem publishing your reply ... Try again <br/> <strong> "+Exception.toString()+" </strong>";
                    }


            },


            handleTitleChange(e){
                this.title = (typeof e === "string" ? e : e.target.value) ;
                this.titleValidationStatus  = [null, ''] ;

                console.log('new title',this.title);

                if (this.title )
                    this.handleLinkChange(e, true);
            },

            async handleLinkChange(e, fromTitle){

                let link =  (typeof e === "string" ? e : e.target.value);

                if (!fromTitle)
                    this.link = link;

                try{
                    let answer = await this.$store.dispatch('CONTENT_URL_META',{link: link});
                    let newAttachments =  this.attachments||[];

                    console.log("handleLinkChange", answer);

                    if (answer.result){

                        if (fromTitle)
                            this.link = link;

                        let bFound=false;
                        for (let i=0; i<newAttachments.length; i++ )
                            if (newAttachments[i].type === 'link'){
                                newAttachments[i].url = link;
                                newAttachments[i].img = (typeof answer.data !== "undefined" ? answer.data.image||'' : '');
                                newAttachments[i].title = (typeof answer.data !== "undefined" ? answer.data.title||'' : '');
                                newAttachments[i].description = (typeof answer.data !== "undefined" ? answer.data.description||'' : '');
                                newAttachments[i].keywords = (typeof answer.data !== "undefined" ? answer.data.keywords||'' : '');
                                bFound=true;
                                break;
                            }

                        if (!bFound)
                            newAttachments.push({
                                type:'link',
                                url: link,
                                img: (typeof answer.data !== "undefined"? answer.data.image : ''),
                                title: (typeof answer.data !== "undefined"? answer.data.title : ''),
                                description: (typeof answer.data !== "undefined" ? answer.data.description : ''),
                                keywords: (typeof answer.data !== "undefined" ? answer.data.keywords : ''),
                            });

                        console.log("newAttachments",newAttachments);
                        this.attachments = newAttachments;
                    }

                }catch (Exception){
                    this.error = "Error extracting Link Meta: " + Exception.toString();
                }

            },

            handleDescriptionChange(editor, content, text){
                //this.descriptionValidationStatus  = [null, ''];
                this.description = content;
            },

            openLogin(){

                if (this.$store.state.global.refAuthenticationModal !== null) {
                    this.$store.state.global.refAuthenticationModal.setOnSuccessEvent(this.authenticationSuccessfully);
                    this.$store.state.global.refAuthenticationModal.openLogin();
                }

            },

            authenticationSuccessfully (userId, resource) {
                this.handleAddReply();
            },

            fileUploadSuccess(type, name, url, thumbnail){

                let newAttachments =  this.attachments||[];
                newAttachments.push({
                    type: 'file',
                    typeFile: type,
                    url: url,
                    img: thumbnail,
                    title: name,
                });

                this.attachments = newAttachments;//storing thew new attachments

            },

            fileUploadRemoved(type, name, url, thumbnail){

                let newAttachments =  this.attachments||[];
                for (let i=0; i<newAttachments.length; i++)
                    if ((newAttachments[i].url === url)&&(newAttachments[i].typeFile===type)&&(newAttachments[i].title === name)&&(newAttachments[i]).img === thumbnail){
                        newAttachments.splice(i,1);
                        break;
                    }
                //console.log("newAttachments",newAttachments);

                this.attachments = newAttachments; //storing thew new attachments
            },


        }

    }

</script>